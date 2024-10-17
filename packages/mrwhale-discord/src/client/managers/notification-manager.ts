import { EmbedBuilder, GuildTextBasedChannel, Message } from "discord.js";

import { DiscordBotClient } from "../discord-bot-client";
import { Settings } from "../../types/settings";
import { loadChannel } from "../../util/load-channel";

const DELETE_NOTIFICATION_AFTER = 5 * 60 * 1000; // 5 minutes

/**
 * The `NotificationManager` class is responsible for managing notifications within a Discord guild.
 * It allows sending notifications to specific text channels and scheduling their deletion after a specified time.
 * It also provides functionality to clear all scheduled notifications for a guild and retrieve the announcement channel for a guild.
 */
export class NotificationManager {
  private guildNotifications: { [guildId: string]: NodeJS.Timeout[] };

  constructor(private bot: DiscordBotClient) {
    this.guildNotifications = {};
  }

  /**
   * Send a notification to a specified text channel and delete it after a specified time.
   * @param channel The text channel to send the notification to.
   * @param embed The embed to send as a notification.
   * @param deleteAfterMs The time in milliseconds after which the notification should be deleted.
   */
  async sendNotification(
    channel: GuildTextBasedChannel,
    embed: EmbedBuilder,
    deleteAfterMs?: number
  ): Promise<Message> {
    // Store the timeout to manage it later if needed
    const guildId = channel.guildId;

    // Send the notification
    const message = await channel.send({ embeds: [embed] });

    // Schedule the deletion of the notification
    const timeout = setTimeout(async () => {
      try {
        if (message && message.deletable) {
          await message.delete();
        }
      } catch (error) {
        this.bot.logger.error(`Failed to delete message: ${error}`);
      }
      this.removeNotificationTimeout(guildId, timeout);
    }, deleteAfterMs || DELETE_NOTIFICATION_AFTER);

    if (!this.guildNotifications[guildId]) {
      this.guildNotifications[guildId] = [];
    }
    this.guildNotifications[guildId].push(timeout);

    return message;
  }

  /**
   * Clear all scheduled notifications for a guild.
   * @param guildId The ID of the guild to clear notifications for.
   */
  clearNotifications(guildId: string): void {
    if (this.guildNotifications[guildId]) {
      this.guildNotifications[guildId].forEach(clearTimeout);
      delete this.guildNotifications[guildId];
    }
  }

  /**
   * Get the channel used for sending bot announcements.
   * @param guildId The identifier of the guild.
   * @param defaultChannel The channel to send if the announcement channel hasn't been set.
   */
  async getAnnouncementChannel(
    guildId: string,
    defaultChannel: GuildTextBasedChannel
  ): Promise<GuildTextBasedChannel> {
    if (!this.bot.guildSettings.has(guildId)) {
      return defaultChannel;
    }

    const settings = this.bot.guildSettings.get(guildId);
    const channelId = await settings.get(
      Settings.AnnouncementChannel,
      defaultChannel.id
    );

    const loadedChannel = await loadChannel(
      this.bot.client,
      channelId,
      defaultChannel
    );

    return loadedChannel as GuildTextBasedChannel;
  }

  private removeNotificationTimeout(
    guildId: string,
    timeout: NodeJS.Timeout
  ): void {
    this.guildNotifications[guildId] = this.guildNotifications[guildId].filter(
      (x) => x !== timeout
    );
  }
}
