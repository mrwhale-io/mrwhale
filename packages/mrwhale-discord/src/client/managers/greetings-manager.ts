import {
  AttachmentBuilder,
  Events,
  Guild,
  GuildMember,
  TextBasedChannel,
} from "discord.js";

import { DiscordBotClient } from "../discord-bot-client";
import { AVATAR_OPTIONS, THEME } from "../../constants";
import { Greeting } from "../../types/image/greeting";
import { Settings } from "../../types/settings";

/**
 * The GreetingsManager class is responsible for greeting new users who join the guild.
 * When a member joins a guild, a greeting message and card will be generated and sent
 * to the appropriate channel.
 *
 * This class listens for the `GuildMemberAdd` event from the Discord client and handles
 * the creation and delivery of personalized greeting messages and cards. The greeting
 * functionality can be enabled or disabled on a per-guild basis, and the target channel
 * for greetings can also be configured.
 */
export class GreetingsManager {
  constructor(private bot: DiscordBotClient) {
    this.bot.client.on(Events.GuildMemberAdd, (guildMember: GuildMember) =>
      this.onGuildMemberAdd(guildMember)
    );
  }

  /**
   * Checks if the greetings feature is enabled for the specified guild.
   * @param guildId The Id of the guild to check.
   * @returns A promise that resolves to a boolean indicating if greetings are enabled.
   */
  private async isGreetingsEnabled(guildId: string): Promise<boolean> {
    if (!this.bot.guildSettings.has(guildId)) {
      return false;
    }

    const settings = this.bot.guildSettings.get(guildId);

    return await settings.get(Settings.Greetings, false);
  }

  /**
   * Retrieves the channel where greeting messages should be sent in the specified guild.
   * @param guild The guild to get the greetings channel for.
   * @returns A promise that resolves to the text-based channel for greetings.
   */
  private async getGreetingsChannel(guild: Guild): Promise<TextBasedChannel> {
    const firstChannel = this.bot.getFirstTextChannel(
      guild
    ) as TextBasedChannel;

    if (!firstChannel) {
      return null;
    }

    const guildId = guild.id;

    if (!this.bot.guildSettings.has(guildId)) {
      return firstChannel;
    }

    const settings = this.bot.guildSettings.get(guildId);
    const channelId = await settings.get(Settings.GreetingChannel);

    if (!channelId) {
      return await this.bot.getAnnouncementChannel(guildId, firstChannel);
    }

    try {
      const channel = this.bot.client.channels.cache.has(channelId)
        ? (this.bot.client.channels.cache.get(channelId) as TextBasedChannel)
        : ((await this.bot.client.channels.fetch(
            channelId
          )) as TextBasedChannel);

      return channel;
    } catch {
      return firstChannel;
    }
  }

  /**
   * Generates a greeting attachment (e.g., an image or card) for the new guild member.
   * @param guildMember The guild member to generate the greeting attachment for.
   * @returns A promise that resolves to an attachment builder containing the greeting.
   */
  private async getGreetingAttachment(
    guildMember: GuildMember
  ): Promise<AttachmentBuilder> {
    return await new Greeting()
      .setGuild(guildMember.guild.name)
      .setAvatarUrl(guildMember.displayAvatarURL(AVATAR_OPTIONS))
      .setUsername(guildMember.user.username)
      .setMessage("Whalecome to {guild.name}, {user.username}!")
      .setMemberCount(guildMember.guild.memberCount)
      .setBackgroundColour(THEME.backgroundColour)
      .setMessageColour(THEME.primaryTextColour)
      .setAvatarColour(THEME.primaryTextColour)
      .setMemberCountColour(THEME.secondaryTextColour)
      .setSecondaryBackgroundColour(THEME.secondaryBackgroundColour)
      .build();
  }

  private async onGuildMemberAdd(guildMember: GuildMember): Promise<void> {
    const isGreetingsEnabled = await this.isGreetingsEnabled(
      guildMember.guild.id
    );

    if (!isGreetingsEnabled) {
      return;
    }

    const greeting = await this.getGreetingAttachment(guildMember);
    const channel = await this.getGreetingsChannel(guildMember.guild);

    if (channel && channel.isTextBased()) {
      channel.send({ files: [greeting] });
    }
  }
}
