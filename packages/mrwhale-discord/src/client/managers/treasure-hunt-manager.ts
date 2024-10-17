import {
  Collection,
  EmbedBuilder,
  Message,
  MessageReaction,
  User,
} from "discord.js";
import { DiscordBotClient } from "../discord-bot-client";
import { Activity } from "../../types/activities/activity";
import { createEmbed } from "../../util/embed/create-embed";
import { getTwemojiUrl } from "../../util/get-twemoji-url";
import {
  getTotalChestsOpenedInGuild,
  logChestOpened,
} from "../../database/services/chests-opened";
import { Settings } from "../../types/settings";
import { Activities } from "../../types/activities/activities";

const MIN_REWARD = 50;
const MAX_REWARD = 100;
const NEXT_TREASURE_HUNT_IN_MILLISECONDS = 3 * 60 * 60 * 1000; // 3 hours
const FINISH_TREASURE_HUNT_IN_MILLSECONDS = 15 * 60 * 1000; // 15 minutes
const DELETE_ANNOUNCEMENT_AFTER = 5 * 60 * 1000; // 5 minutes

/**
 * Manages treasure hunt activities within a Discord guild.
 */
export class TreasureHuntManager {
  constructor(private botClient: DiscordBotClient) {}

  /**
   * Initiates a treasure hunt activity in the specified guild.
   *
   * @param activity - The activity object containing details about the treasure hunt.
   * @returns A promise that resolves when the treasure hunt has started.
   */
  async startTreasureHunt(activity: Activity): Promise<void> {
    const areTreasureHuntsEnabled = await this.areTreasureHuntsEnabled(
      activity.guildId
    );

    if (!areTreasureHuntsEnabled) {
      return;
    }

    // Get the configured guild channel for announcements
    const announcementChannel = await this.botClient.getFishingAnnouncementChannel(
      activity.guildId
    );
    const activityTime = activity.endTime - Date.now();
    const treasureAnnouncement = await this.getInitialTreasureChestEmbed(
      activity
    );

    const deleteAfterInMillseconds =
      activity.endTime - activity.startTime + DELETE_ANNOUNCEMENT_AFTER;
    const treasureMessage = await this.botClient.notificationManager.sendNotification(
      announcementChannel,
      treasureAnnouncement,
      deleteAfterInMillseconds
    );

    await treasureMessage.react("🔑");

    const filter = (reaction: MessageReaction, user: User) =>
      reaction.emoji.name === "🔑" && !user.bot;
    const collector = treasureMessage.createReactionCollector({
      filter,
      time: activityTime,
    });

    collector.on("end", async () => {
      const participants = collector.users.filter((user) => !user.bot);
      if (participants.size > 0) {
        this.rewardParticipants(
          activity.guildId,
          participants,
          treasureMessage
        );
      } else {
        const rewardTreasureEmbed = createEmbed(
          "😞 The treasure chest vanished because no one helped open it."
        )
          .setTitle("Treasure Chest")
          .setThumbnail(getTwemojiUrl("🏴‍☠️"));
        treasureMessage.edit({
          embeds: [rewardTreasureEmbed],
        });
      }
    });
  }

  /**
   * Requests a treasure hunt activity to be scheduled in the specified guild.
   *
   * @param guildId The ID of the guild where the treasure hunt will take place.
   */
  async requestTreasureHuntActivity(guildId: string): Promise<void> {
    const areAnnouncementsEnabled = await this.areTreasureHuntsEnabled(guildId);
    // Check if treasure hunts are enabled in the guild
    if (!areAnnouncementsEnabled) {
      return;
    }

    const currentTime = Date.now();
    const startTime = currentTime + NEXT_TREASURE_HUNT_IN_MILLISECONDS;
    const endTime = startTime + FINISH_TREASURE_HUNT_IN_MILLSECONDS;

    // Create a treasure hunt activity
    const treasureHuntActivity: Activity = {
      name: Activities.TreasureHunt,
      guildId,
      startTime,
      endTime,
    };

    // Get the activity scheduler for the guild
    const scheduler = this.botClient.activitySchedulerManager.getScheduler(
      guildId
    );

    // Add the treasure hunt activity to the scheduler
    if (scheduler && scheduler.addActivity(treasureHuntActivity)) {
      this.botClient.logger.info(
        `Scheduled treasure hunt event for guild: ${guildId}`
      );
    }
  }

  private rewardParticipants(
    guildId: string,
    participants: Collection<string, User>,
    treasureMessage: Message
  ): void {
    const scaleReward = Math.min(
      MAX_REWARD,
      MIN_REWARD + participants.size * 10
    );
    const rewardTreasureEmbed = this.getTreasureChestOpenedEmbed(scaleReward);
    treasureMessage.edit({
      embeds: [rewardTreasureEmbed],
    });
    participants.forEach(async (user) => {
      await this.botClient.addToUserBalance(guildId, user.id, scaleReward);
      await logChestOpened(user.id, guildId);
    });
  }

  private async getInitialTreasureChestEmbed(
    activity: Activity
  ): Promise<EmbedBuilder> {
    const totalChestsOpened = await getTotalChestsOpenedInGuild(
      activity.guildId
    );
    const activityEndInSeconds = Math.floor(activity.endTime / 1000);
    const treasureAnnouncement = createEmbed(
      "I've stumbled upon a treasure chest filled with gems and rare items! Help me open it by reacting with a 🔑"
    )
      .setTitle("Treasure Chest")
      .setThumbnail(getTwemojiUrl("🏴‍☠️"))
      .addFields(
        {
          name: "Time Limit",
          value: `⏳ The chest will vanish <t:${activityEndInSeconds}:R>`,
          inline: false,
        },
        {
          name: "Total Chests Opened",
          value: `🔑 ${totalChestsOpened}`,
          inline: false,
        }
      )
      .setFooter({
        text: "React with 🔑 to participate!",
      })
      .setTimestamp();

    return treasureAnnouncement;
  }

  private getTreasureChestOpenedEmbed(reward: number): EmbedBuilder {
    const treasureAnnouncement = createEmbed(
      `🎉 The treasure chest is opened! Thanks for your help, everyone! `
    )
      .setTitle("Treasure Chest")
      .setThumbnail(getTwemojiUrl("🏴‍☠️"))
      .addFields({
        name: "Gems Rewarded",
        value: `💎 +${reward}`,
        inline: true,
      })
      .setTimestamp();

    return treasureAnnouncement;
  }

  /**
   * Checks if treasure hunts are enabled for a given guild.
   *
   * @param guildId - The ID of the guild to check.
   * @returns A promise that resolves to a boolean indicating whether treasure hunts are enabled.
   */
  private async areTreasureHuntsEnabled(guildId: string): Promise<boolean> {
    if (!this.botClient.guildSettings.has(guildId)) {
      return true;
    }

    const settings = this.botClient.guildSettings.get(guildId);

    return await settings.get(Settings.TreasureHunts, true);
  }
}
