import {
  ChannelType,
  Events,
  Interaction,
  Message,
  TextBasedChannel,
} from "discord.js";

import {
  LEVEL_UP_MESSAGES,
  getLevelFromExp,
  getRandomInt,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { Score, ScoreInstance } from "../../database/models/score";

const TIME_FOR_EXP = 6e4;
const MIN_EXP_EARNED = 15;
const MAX_EXP_EARNED = 25;

interface MessageMap {
  [guildId: number]: { [user: number]: number };
}

export class LevelManager {
  private lastMessages: MessageMap;

  constructor(private bot: DiscordBotClient) {
    this.lastMessages = {};
    this.bot.client.on(Events.MessageCreate, (message: Message) =>
      this.onMessage(message)
    );
  }

  /**
   * Checks whether levels are enabled in the guild.
   * @param guildId The identifier of the guild.
   */
  async isLevelsEnabled(guildId: string): Promise<boolean> {
    if (!this.bot.guildSettings.has(guildId)) {
      return true;
    }

    const settings = this.bot.guildSettings.get(guildId);

    return await settings.get("levels", true);
  }

  /**
   * Get guild scores.
   * @param guildId The guild id to get scores for.
   */
  static async getScores(guildId: string): Promise<ScoreInstance[]> {
    return await Score.findAll<ScoreInstance>({
      where: {
        guildId,
      },
    });
  }

  /**
   * Get user score in a guild.
   * @param guildId The guild id to get scores for.
   * @param userId The user id to get scores for.
   */
  static async getUserScore(
    guildId: string,
    userId: string
  ): Promise<ScoreInstance> {
    return await Score.findOne({
      where: {
        guildId,
        userId,
      },
    });
  }

  /**
   * Get an existing user score record or create if one doesn't exist.
   * @param userId The identifier of the user.
   * @param guildId The identifier of the guild.
   */
  static async getorCreateScore(userId: string, guildId: string) {
    let score = await LevelManager.getUserScore(guildId, userId);

    if (!score) {
      score = Score.build({
        userId,
        guildId,
        exp: 0,
      });
    }

    return score;
  }

  /**
   * Removes all the leaderboard scores for a given guild id.
   * @param guildId The guild id to remove scores for.
   */
  static async removeAllScoresForGuild(guildId: string): Promise<number> {
    return await Score.destroy({
      where: {
        guildId,
      },
    });
  }

  /**
   * Removes all the leaderboard scores for a given user id.
   * @param userId The user id to remove scores for.
   */
  static async removeAllScoresForUser(userId: string): Promise<number> {
    return await Score.destroy({
      where: {
        userId,
      },
    });
  }

  /**
   * Increase the EXP for the user by the given amount.
   * @param interaction The interaction or message.
   * @param expGained The amount of exp to give.
   */
  async increaseExp(
    interaction: Interaction | Message,
    expGained: number
  ): Promise<void> {
    const score = await LevelManager.getorCreateScore(
      interaction.member.user.id,
      interaction.guildId
    );
    const level = getLevelFromExp(score.exp);

    score.exp += expGained;
    score.save();

    const newLevel = getLevelFromExp(score.exp);

    if (newLevel > level) {
      const channel = await this.getLevelUpAnnouncementChannel(interaction);
      const announcementLevelUpMessage = this.getRandomLevelUpAnnouncement(
        interaction,
        level
      );
      channel.send({
        content: announcementLevelUpMessage,
        allowedMentions: { users: [] },
      });
    }
  }

  private isTimeForExp(guildId: string, userId: string) {
    if (!this.lastMessages[guildId]) {
      this.lastMessages[guildId] = {};
    }

    const lastMessageTimestamp =
      this.lastMessages[guildId][userId] || -Infinity;

    return Date.now() - lastMessageTimestamp >= TIME_FOR_EXP;
  }

  private async getLevelUpAnnouncementChannel(
    message: Interaction | Message
  ): Promise<TextBasedChannel> {
    const guildId = message.guildId;
    if (!this.bot.guildSettings.has(guildId)) {
      return message.channel;
    }

    const settings = this.bot.guildSettings.get(guildId);
    const channelId = await settings.get("levelChannel");

    if (!channelId) {
      return await this.bot.getAnnouncementChannel(guildId, message.channel);
    }

    try {
      const channel = this.bot.client.channels.cache.has(channelId)
        ? (this.bot.client.channels.cache.get(channelId) as TextBasedChannel)
        : ((await this.bot.client.channels.fetch(
            channelId
          )) as TextBasedChannel);

      return channel;
    } catch {
      return message.channel;
    }
  }

  private getRandomLevelUpAnnouncement(
    interaction: Interaction | Message,
    level: number
  ): string {
    const mood = this.bot.getCurrentMood(interaction.guildId);
    const announcements = LEVEL_UP_MESSAGES[mood];
    const message = announcements[
      Math.floor(Math.random() * announcements.length)
    ].replace("<<LEVEL>>", level.toString());

    return `<@${interaction.member.user.id}> ${message}`;
  }

  private async onMessage(message: Message): Promise<void> {
    const isEnabled = await this.isLevelsEnabled(message.guildId);
    const dm = message.channel.type === ChannelType.DM;

    if (message.author.bot || dm || !isEnabled) {
      return;
    }

    const timeForExp = this.isTimeForExp(message.guildId, message.author.id);

    if (!timeForExp) {
      return;
    }

    this.lastMessages[message.guildId][message.author.id] = Date.now();

    const expGained = getRandomInt(MIN_EXP_EARNED, MAX_EXP_EARNED);
    this.increaseExp(message, expGained);

    await this.bot.userManager.addToUserBalance(message.author.id, 1);
  }
}
