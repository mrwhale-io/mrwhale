import {
  AttachmentBuilder,
  Events,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  TextBasedChannel,
} from "discord.js";

import { GREETINGS } from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { AVATAR_OPTIONS, THEME } from "../../constants";
import { Greeting } from "../../types/image/greeting";
import { Settings } from "../../types/settings";
import { getFirstTextChannel } from "../../util/get-first-text-channel";
import { loadChannel } from "../../util/load-channel";

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
    const firstChannel = getFirstTextChannel(guild) as GuildTextBasedChannel;

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
      return await this.bot.notificationManager.getAnnouncementChannel(
        guildId,
        firstChannel
      );
    }

    return loadChannel(this.bot.client, channelId, firstChannel);
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
      .setMessage("{user.username} just joined {guild.name}")
      .setMemberCount(guildMember.guild.memberCount)
      .setBackgroundColour(THEME.backgroundColour)
      .setMessageColour(THEME.primaryTextColour)
      .setAvatarColour(THEME.primaryTextColour)
      .setMemberCountColour(THEME.secondaryTextColour)
      .setSecondaryBackgroundColour(THEME.secondaryBackgroundColour)
      .build();
  }

  /**
   * Generates a random greeting announcement.
   *
   * @param guildMember The guild member to generate the greeting announcement for.
   * @returns A promise containing a random greeting announcement.
   */
  private async getRandomGreetingAnnouncement(
    guildMember: GuildMember
  ): Promise<string> {
    const mood = await this.bot.getCurrentMood(guildMember.guild.id);
    const greetings = GREETINGS[mood];
    const greetingAnnouncement = greetings[
      Math.floor(Math.random() * greetings.length)
    ].replace("<<USER>>", `<@${guildMember.user.id}>`);

    return greetingAnnouncement;
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
    const announcement = await this.getRandomGreetingAnnouncement(guildMember);

    if (channel && channel.isTextBased()) {
      channel.send({ content: announcement, files: [greeting] });
    }
  }
}
