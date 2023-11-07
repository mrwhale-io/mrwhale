import { ChannelType, Message, TextBasedChannel } from "discord.js";
import { getLevelFromExp, getRandomInt } from "@mrwhale-io/core";

import { DiscordBotClient } from "../discord-bot-client";
import { Score, ScoreInstance } from "../../database/models/score";

const TIME_FOR_EXP = 6e4;

interface MessageMap {
  [guildId: number]: { [user: number]: number };
}

export class LevelManager {
  private lastMessages: MessageMap;

  constructor(private bot: DiscordBotClient) {
    this.lastMessages = {};
    this.bot.client.on("messageCreate", (message: Message) =>
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

  private isTimeForExp(guildId: string, userId: string) {
    if (!this.lastMessages[guildId]) {
      this.lastMessages[guildId] = {};
    }

    const lastMessageTimestamp =
      this.lastMessages[guildId][userId] || -Infinity;

    return Date.now() - lastMessageTimestamp >= TIME_FOR_EXP;
  }

  private async getScore(userId: string, guildId: string) {
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

  private async getAnnouncementChannel(
    message: Message
  ): Promise<TextBasedChannel> {
    if (!this.bot.guildSettings.has(message.guildId)) {
      return message.channel;
    }

    const settings = this.bot.guildSettings.get(message.guildId);
    const channelId = await settings.get("levelChannel", message.channel.id);

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

  protected async onMessage(message: Message): Promise<void> {
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

    const expGained = getRandomInt(15, 25);
    const score = await this.getScore(message.author.id, message.guildId);
    const level = getLevelFromExp(score.exp);

    score.exp += expGained;
    score.save();

    const newLevel = getLevelFromExp(score.exp);

    if (newLevel > level) {
      const channel = await this.getAnnouncementChannel(message);
      channel.send({
        content: `<@${message.author.id}> just advanced to level ${newLevel}!`,
        allowedMentions: { users: [] },
      });
    }
  }
}
