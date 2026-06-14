import {
  EmbedBuilder,
  Guild,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildTextBasedChannel,
  TextChannel,
} from "discord.js";

import { DiscordBotClient } from "../discord-bot-client";
import { Jam, JamInstance } from "../../database/models/jam";
import {
  JamSubmission,
  JamSubmissionInstance,
} from "../../database/models/jam-submission";
import {
  JAM_ANNOUNCEMENT_INTROS,
  JAM_CLOSE_INTROS,
  DAILY_PROMPTS,
  getRandomJamElement,
  getNextTheme,
} from "../../data/jam-data";
import { Settings } from "../../types/settings";
import { EMBED_COLOR } from "../../constants";

const JAM_DURATION_DAYS = 7;
const JAM_DURATION_HOURS = JAM_DURATION_DAYS * 24;
const JAM_CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour
const JAM_START_DAY = 0; // Sunday (0 = Sunday in JS Date)
const JAM_START_HOUR_UTC = 12; // Noon UTC

/**
 * Manages the weekly game jam lifecycle: creation, daily prompts, closing, and winner announcement.
 */
export class JamManager {
  private checkIntervalId: NodeJS.Timeout | null = null;

  constructor(private bot: DiscordBotClient) {}

  /**
   * Starts the hourly check loop for all guilds.
   * Should be called once the bot is ready.
   */
  async start(): Promise<void> {
    // Ensure tables exist (safe to call on every startup with alter: true)
    await Jam.sync({ alter: true });
    await JamSubmission.sync({ alter: true });

    this.runCheck();
    this.checkIntervalId = setInterval(
      () => this.runCheck(),
      JAM_CHECK_INTERVAL_MS,
    );
  }

  /**
   * Stops the check loop.
   */
  stop(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  /**
   * Gets the currently active jam for a guild, or null if none.
   * @param guildId The ID of the guild to retrieve the active jam for.
   * @returns The active jam instance, or null if none exist.
   */
  async getCurrentJam(guildId: string): Promise<JamInstance | null> {
    return Jam.findOne({
      where: { guildId, status: "active" },
      order: [["startDate", "DESC"]],
    });
  }

  /**
   * Gets all closed jams for a guild, ordered by most recent first.
   * Returns an empty array if none exist.
   * @param guildId The ID of the guild to retrieve past jams for.
   * @param limit The maximum number of past jams to retrieve (default: 10).
   * @returns An array of past jam instances.
   */
  async getPastJams(guildId: string, limit = 10): Promise<JamInstance[]> {
    return Jam.findAll({
      where: { guildId, status: "closed" },
      order: [["endDate", "DESC"]],
      limit,
    });
  }

  /**
   * Gets all submissions for a given jam.
   * Returns an empty array if no submissions exist.
   * @param jamId The ID of the jam to retrieve submissions for.
   * @returns An array of jam submission instances.
   */
  async getSubmissions(jamId: number): Promise<JamSubmissionInstance[]> {
    return JamSubmission.findAll({
      where: { jamId },
      order: [["submittedAt", "ASC"]],
    });
  }

  /**
   * Creates a jam immediately for a guild.
   * Useful for testing or when an automatic Sunday run was missed.
   *
   * @param guildId The ID of the guild to create the jam in.
   * @param durationHours The duration of the jam in hours (default: 168 hours = 7 days).
   * @returns An object indicating success or failure, and the jam if successful.
   */
  async createJamNow(
    guildId: string,
    durationHours: number = JAM_DURATION_HOURS,
  ): Promise<{ success: boolean; error?: string; jam?: JamInstance }> {
    const guild = this.bot.client.guilds.cache.get(guildId);
    if (!guild) {
      return { success: false, error: "Guild not found." };
    }

    const activeJam = await this.getCurrentJam(guildId);
    if (activeJam) {
      return {
        success: false,
        error: `A jam is already active (#${activeJam.weekNumber}, theme: ${activeJam.theme}).`,
      };
    }

    if (!Number.isFinite(durationHours) || durationHours < 1) {
      return {
        success: false,
        error: "Duration must be at least 1 hour.",
      };
    }

    const jam = await this.createNewJam(guild, durationHours);
    if (!jam) {
      return {
        success: false,
        error:
          "Could not create jam. Make sure a jam channel is configured with `/setjamchannel`.",
      };
    }

    return { success: true, jam };
  }

  /**
   * Submits a game to the current active jam for a guild.
   * Returns an error string on failure, or the submission on success.
   *
   * @param guildId The ID of the guild where the jam is active.
   * @param userId The ID of the user submitting the game.
   * @param gameTitle The title of the submitted game.
   * @param gameUrl The URL of the submitted game.
   * @param description An optional description of the game.
   * @returns An object indicating success or failure, and the submission if successful.
   */
  async submitGame(
    guildId: string,
    userId: string,
    gameTitle: string,
    gameUrl: string,
    description?: string,
  ): Promise<{
    success: boolean;
    error?: string;
    submission?: JamSubmissionInstance;
  }> {
    const jam = await this.getCurrentJam(guildId);

    if (!jam) {
      return {
        success: false,
        error: "There is no active game jam right now. Check back next week!",
      };
    }

    const existing = await JamSubmission.findOne({
      where: { jamId: jam.id, userId },
    });
    if (existing) {
      return {
        success: false,
        error:
          "You've already submitted a game to this jam. Each participant may only submit once.",
      };
    }

    try {
      const submission = await JamSubmission.create({
        jamId: jam.id,
        userId,
        guildId,
        gameTitle: gameTitle.slice(0, 100),
        gameUrl,
        description: description?.slice(0, 500) ?? null,
        submittedAt: new Date(),
      });

      return { success: true, submission };
    } catch {
      return {
        success: false,
        error: "Failed to save your submission. Please try again.",
      };
    }
  }

  /**
   * Sets the winner of a jam by submission ID.
   * Returns an error string on failure.
   * 
   * @param guildId The ID of the guild where the jam is active.
   * @param jamId The ID of the jam to set the winner for.
   * @param submissionId The ID of the submission to declare as the winner.
   * @returns An object indicating success or failure, and the winning submission if successful.
   */
  async setWinner(
    guildId: string,
    jamId: number,
    submissionId: number,
  ): Promise<{
    success: boolean;
    error?: string;
    submission?: JamSubmissionInstance;
  }> {
    const jam = await Jam.findOne({ where: { id: jamId, guildId } });
    if (!jam) {
      return { success: false, error: "Jam not found." };
    }

    const submission = await JamSubmission.findOne({
      where: { id: submissionId, jamId },
    });
    if (!submission) {
      return {
        success: false,
        error: `Submission #${submissionId} not found in this jam.`,
      };
    }

    await jam.update({ winnerSubmissionId: submissionId, status: "closed" });

    await this.announceWinner(guildId, jam, submission);

    return { success: true, submission };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async runCheck(): Promise<void> {
    for (const [, guild] of this.bot.client.guilds.cache) {
      try {
        await this.checkGuild(guild);
      } catch (error) {
        this.bot.logger.error(
          `JamManager: error checking guild ${guild.id}:`,
          error,
        );
      }
    }
  }

  private async checkGuild(guild: Guild): Promise<void> {
    // Check if weekly jams are enabled for this guild
    const settings = this.bot.guildSettings.get(guild.id);
    if (!settings) return;
    const jamEnabled = settings.get(Settings.WeeklyJam, false);
    if (!jamEnabled) return;

    // Close any expired active jams
    const activeJam = await this.getCurrentJam(guild.id);
    if (activeJam && new Date() >= activeJam.endDate) {
      await this.closeJam(guild, activeJam);
      return;
    }

    // Post daily prompt if active jam and not yet posted today
    if (activeJam) {
      await this.maybePostDailyPrompt(guild, activeJam);
      return;
    }

    // Start a new jam if it's time
    if (this.isSundayNoon()) {
      const lastJam = await Jam.findOne({
        where: { guildId: guild.id },
        order: [["startDate", "DESC"]],
      });
      // Guard: don't create a new jam if the last one ended less than 6 days ago
      if (lastJam) {
        const daysSinceLast =
          (Date.now() - lastJam.endDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLast < 6) return;
      }
      await this.createNewJam(guild);
    }
  }

  private async createNewJam(
    guild: Guild,
    durationHours: number = JAM_DURATION_HOURS,
  ): Promise<JamInstance | null> {
    const channel = await this.getJamChannel(guild);
    if (!channel) {
      this.bot.logger.warn(
        `JamManager: no jam channel configured for guild ${guild.id}`,
      );
      return null;
    }

    // Determine theme (avoid recently used)
    const recentJams = await Jam.findAll({
      where: { guildId: guild.id },
      order: [["startDate", "DESC"]],
      limit: JAM_THEMES_AVOID_COUNT,
    });
    const usedThemes = recentJams.map((j) => j.theme);
    const theme = getNextTheme(usedThemes);

    // Determine week number
    const jamCount = await Jam.count({ where: { guildId: guild.id } });
    const weekNumber = jamCount + 1;

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + durationHours * 60 * 60 * 1000,
    );

    const jam = await Jam.create({
      guildId: guild.id,
      theme,
      weekNumber,
      status: "active",
      startDate,
      endDate,
      winnerSubmissionId: null,
      discordEventId: null,
      announcementMessageId: null,
      lastDailyPromptDate: null,
    });

    // Post announcement
    const embed = this.buildAnnouncementEmbed(jam);
    const intro = getRandomJamElement(JAM_ANNOUNCEMENT_INTROS);
    const message = await channel.send({
      content: `🐳 **${intro}**`,
      embeds: [embed],
    });

    await jam.update({ announcementMessageId: message.id });

    // Try to create a Discord scheduled event
    try {
      const event = await guild.scheduledEvents.create({
        name: `🐳 Mr. Whale's Weekly Jam #${weekNumber}`,
        description: `Theme: **${theme}**\n\nBuild a microgame inspired by this theme. Submit with \`/jamsubmit\`!`,
        scheduledStartTime: startDate,
        scheduledEndTime: endDate,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        entityMetadata: { location: `#${(channel as TextChannel).name}` },
      });
      await jam.update({ discordEventId: event.id });
    } catch {
      // Discord events are optional — don't fail the whole jam
    }

    this.bot.logger.info(
      `JamManager: started jam #${weekNumber} in guild ${guild.id} with theme "${theme}"`,
    );

    return jam;
  }

  private async maybePostDailyPrompt(
    guild: Guild,
    jam: JamInstance,
  ): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    if (jam.lastDailyPromptDate === today) return;

    // Don't post on the day the jam starts (announcement already covers it)
    const jamStartDate = jam.startDate.toISOString().split("T")[0];
    if (today === jamStartDate) return;

    const channel = await this.getJamChannel(guild);
    if (!channel) return;

    const prompt = getRandomJamElement(DAILY_PROMPTS);
    const daysLeft = Math.ceil(
      (jam.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    const embed = new EmbedBuilder()
      .setColor(0x1a7fd4)
      .setTitle("🌊 Today's Deep Sea Inspiration")
      .setDescription(`*"${prompt}"*`)
      .addFields(
        { name: "🎯 Current Theme", value: `**${jam.theme}**`, inline: true },
        {
          name: "⏳ Days Remaining",
          value: `${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
          inline: true,
        },
      )
      .setFooter({
        text: `Submit your game with /jamsubmit • Jam #${jam.weekNumber}`,
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    await jam.update({ lastDailyPromptDate: today });
  }

  private async closeJam(guild: Guild, jam: JamInstance): Promise<void> {
    await jam.update({ status: "closed" });

    const channel = await this.getJamChannel(guild);
    if (!channel) return;

    const submissions = await this.getSubmissions(jam.id);
    const submissionCount = submissions.length;

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`Jam #${jam.weekNumber} Has Ended!`)
      .setDescription(
        `**Theme: ${jam.theme}**\n\n` +
          `${getRandomJamElement(JAM_CLOSE_INTROS)}\n\n` +
          (submissionCount > 0
            ? `We received **${submissionCount}** submission${
                submissionCount !== 1 ? "s" : ""
              }!\n\nUse \`/jamwinner\` to select and announce the winner.`
            : `No submissions were received for this jam. Perhaps the squid council scared everyone away.`),
      )
      .setFooter({ text: "Thanks to all participants!" })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // End the Discord event if it exists
    if (jam.discordEventId) {
      try {
        const event = await guild.scheduledEvents.fetch(jam.discordEventId);
        if (event) await event.delete();
      } catch {
        // Ignore if event already gone
      }
    }

    this.bot.logger.info(
      `JamManager: closed jam #${jam.weekNumber} in guild ${guild.id} with ${submissionCount} submissions`,
    );
  }

  private async announceWinner(
    guildId: string,
    jam: JamInstance,
    submission: JamSubmissionInstance,
  ): Promise<void> {
    const guild = this.bot.client.guilds.cache.get(guildId);
    if (!guild) return;

    const channel = await this.getJamChannel(guild);
    if (!channel) return;

    let winnerTag = `<@${submission.userId}>`;
    try {
      const member = await guild.members.fetch(submission.userId);
      winnerTag = member.toString();
    } catch {
      // User may have left
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`🏆 Jam #${jam.weekNumber} Winner Announced!`)
      .setDescription(
        `*"After consulting the ancient whale council..."*\n\n` +
          `The winner of **${jam.theme}** is... ${winnerTag}! 🎉`,
      )
      .addFields(
        {
          name: "🎮 Game",
          value: `[${submission.gameTitle}](${submission.gameUrl})`,
        },
        ...(submission.description
          ? [{ name: "📝 Description", value: submission.description }]
          : []),
      )
      .setFooter({
        text: `🐋 Congratulations from Mr. Whale and the squid council!`,
      })
      .setTimestamp();

    await channel.send({
      content: `🎊 Congratulations ${winnerTag}!`,
      embeds: [embed],
    });
  }

  /**
   * Gets the configured jam channel for a guild, falling back to the announcement channel.
   * If no channel is configured, returns null.
   *
   * @param guild The guild to get the jam channel for.
   * @returns The text channel to use for jam announcements, or null if none is configured.
   */
  async getJamChannel(guild: Guild): Promise<GuildTextBasedChannel | null> {
    const settings = this.bot.guildSettings.get(guild.id);

    if (settings) {
      const channelId = settings.get<string>(Settings.JamChannel);

      if (channelId) {
        try {
          const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId));

          return channel as GuildTextBasedChannel;
        } catch (error) {
          // Channel may have been deleted
        }
      }
    }
    return null;
  }

  private buildAnnouncementEmbed(jam: JamInstance): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`Weekly Jam #${jam.weekNumber}`)
      .setDescription(
        `**🎯 Theme: ${jam.theme}**\n\n` +
          `Build a microgame (5-8 seconds) inspired by this theme!\n\n` +
          `**📋 Rules:**\n` +
          `- Make something short — Warioware-style microgames!\n` +
          `- Submit using \`/jamsubmit\` before the deadline\n` +
          `- One submission per person\n\n` +
          `**🏆 Prizes:**\n` +
          `- Winner receives the Champion of the Deep role\n` +
          `- Fame, glory, and whale approval`,
      )
      .addFields(
        {
          name: "📅 Ends",
          value: `<t:${Math.floor(jam.endDate.getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: "⏳ Duration",
          value: `${JAM_DURATION_DAYS} days`,
          inline: true,
        },
      )
      .setFooter({ text: "Good luck, land dwellers. 🐋" })
      .setTimestamp();
  }

  private isSundayNoon(): boolean {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const hourUTC = now.getUTCHours();
    return dayOfWeek === JAM_START_DAY && hourUTC === JAM_START_HOUR_UTC;
  }
}

// Avoid reusing the last N themes
const JAM_THEMES_AVOID_COUNT = 10;
