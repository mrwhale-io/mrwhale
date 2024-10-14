import {
  Collection,
  EmbedBuilder,
  Message,
  MessageReaction,
  User,
} from "discord.js";

import { ActivityHandler } from "../client/activity/activity-handler";
import { Activity } from "../types/activities/activity";
import { Activities } from "../types/activities/activities";
import { createEmbed } from "../util/embed/create-embed";
import { getTwemojiUrl } from "../util/get-twemoji-url";
import {
  getTotalChestsOpenedInGuild,
  logChestOpened,
} from "../database/services/chests-opened";
import { Settings } from "../types/settings";

const MIN_REWARD = 50;
const MAX_REWARD = 100;

export default class extends ActivityHandler {
  constructor() {
    super({
      name: Activities.TreasureHunt,
    });
  }

  async action(activity: Activity): Promise<void> {
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
    const treasureMessage = await announcementChannel.send({
      embeds: [treasureAnnouncement],
    });

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

  private async areTreasureHuntsEnabled(guildId: string): Promise<boolean> {
    if (!this.botClient.guildSettings.has(guildId)) {
      return true;
    }

    const settings = this.botClient.guildSettings.get(guildId);

    return await settings.get(Settings.TreasureHunts, true);
  }
}
