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
import { Settings } from "../../types/settings";

const TIME_FOR_EXP = 18e4;
const MIN_EXP_EARNED = 5;
const MAX_EXP_EARNED = 15;
const MIN_GEMS_EARNED = 1;
const MAX_GEMS_EARNED = 5;

interface MessageMap {
  [guildId: number]: { [user: number]: number };
}

/**
 * The LevelManager class is responsible for managing and awarding experience points (EXP) to users within the Discord bot.
 * It handles the following functionalities:
 *
 * - Awarding EXP: Increase the EXP for users based on various actions and achievements within the bot.
 * - Level Calculation: Determine the user's level based on their accumulated EXP.
 * - Announcements: Sends a level-up announcement in the specified channel when a user levels up.
 *
 * The class interacts with the database to persist user scores and ensure that level progression is tracked accurately.
 * It also includes methods for fetching and updating user scores, calculating levels, and generating level-up messages.
 *
 * Usage:
 * - `increaseExp(interaction, userId, guildId, expGained)`: Increase the user's EXP by a specified amount.
 * - Automatically sends a level-up announcement if the user reaches a new level.
 */
export class LevelManager {
  private lastMessages: MessageMap;

  constructor(private bot: DiscordBotClient) {
    this.lastMessages = {};
    this.bot.client.on(Events.MessageCreate, (message: Message) =>
      this.onMessage(message)
    );
  }

  /**
   * Checks whether the level-up notifications are enabled for a specific guild.
   *
   * This method retrieves the settings for the specified guild and determines if the level-up
   * notifications are enabled. If the settings for the guild are not found, it defaults to true,
   * indicating that level-up notifications are enabled by default.
   *
   * @param guildId The Id of the guild to check the level-up notifications setting for.
   * @returns A promise that resolves to a boolean indicating whether level-up notifications are enabled.
   */
  async areLevelUpsEnabled(guildId: string): Promise<boolean> {
    if (!this.bot.guildSettings.has(guildId)) {
      return true;
    }

    const settings = this.bot.guildSettings.get(guildId);

    return await settings.get(Settings.Levels, true);
  }

  /**
   * Retrieves all the scores for the given guild.
   *
   * @param guildId The Id of the guild to retrieve the scores.
   */
  static async getScores(guildId: string): Promise<ScoreInstance[]> {
    return await Score.findAll<ScoreInstance>({
      where: {
        guildId,
      },
    });
  }

  /**
   * Retrieves the score for a specific user in a given guild.
   *
   * @param guildId The Id of the guild from which to retrieve the user's score.
   * @param userId The Id of the user whose score is to be retrieved.
   * @returns A promise that resolves to the user's score instance, or null if no score is found.
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
   * Retrieves the user's score for the specified guild. If the user does not have an existing score,
   * a new score record is created with an initial EXP of 0.
   *
   * @param userId The Id of the user whose score is to be retrieved or created.
   * @param guildId The Id of the guild for which the user's score is to be retrieved or created.
   * @returns The user's score instance for the specified guild.
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
   * Removes all the leaderboard scores for the specified guild.

   * @param guildId The Id of the guild to remove the scores for.
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
   * Increases the experience points (EXP) for the user by the given amount and handles level-up announcements.
   *
   * This method retrieves or creates the user's score record for the specified guild, updates the user's EXP,
   * and checks if the user has leveled up. If the user levels up, it sends a level-up announcement in the appropriate channel.
   *
   * @param interactionOrMessage The interaction or message that triggered the EXP increase.
   * @param userId The Id of the user whose EXP is being increased.
   * @param guildId The Id of the guild where the EXP increase is taking place.
   * @param expGained The amount of EXP to give to the user
   */
  async increaseExp(
    interactionOrMessage: Interaction | Message,
    userId: string,
    guildId: string,
    expGained: number
  ): Promise<void> {
    const score = await LevelManager.getorCreateScore(userId, guildId);
    const level = getLevelFromExp(score.exp);

    score.exp += expGained;
    score.save();

    const newLevel = getLevelFromExp(score.exp);
    const areLevelsEnabled = await this.areLevelUpsEnabled(guildId);

    if (newLevel > level && areLevelsEnabled) {
      const channel = await this.getLevelUpAnnouncementChannel(
        interactionOrMessage
      );
      const announcementLevelUpMessage = await this.getRandomLevelUpAnnouncement(
        interactionOrMessage,
        newLevel
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

  /**
   * Fetches the channel where level-up announcements should be sent.
   *
   * @param interactionOrMessage The interaction or message that triggered the level-up announcement.
   * @returns The text channel where level-up announcements should be sent.
   */
  private async getLevelUpAnnouncementChannel(
    interactionOrMessage: Interaction | Message
  ): Promise<TextBasedChannel> {
    const guildId = interactionOrMessage.guildId;
    if (!this.bot.guildSettings.has(guildId)) {
      return interactionOrMessage.channel;
    }

    const settings = this.bot.guildSettings.get(guildId);
    const channelId = await settings.get(Settings.LevelChannel);

    if (!channelId) {
      return await this.bot.getAnnouncementChannel(
        guildId,
        interactionOrMessage.channel
      );
    }

    try {
      const channel = this.bot.client.channels.cache.has(channelId)
        ? (this.bot.client.channels.cache.get(channelId) as TextBasedChannel)
        : ((await this.bot.client.channels.fetch(
            channelId
          )) as TextBasedChannel);

      return channel;
    } catch {
      return interactionOrMessage.channel;
    }
  }

  /**
   * Generates a random level-up announcement message.
   *
   * @param interaction The interaction or message that triggered the level-up announcement.
   * @param newLevel The new level that the user has reached.
   * @returns A promise containing a random level-up announcement message.
   */
  private async getRandomLevelUpAnnouncement(
    interaction: Interaction | Message,
    newLevel: number
  ): Promise<string> {
    const mood = await this.bot.getCurrentMood(interaction.guildId);
    const announcements = LEVEL_UP_MESSAGES[mood];
    const message = announcements[
      Math.floor(Math.random() * announcements.length)
    ].replace("<<LEVEL>>", newLevel.toString());

    return `<@${interaction.member.user.id}> ${message}`;
  }

  private async onMessage(message: Message): Promise<void> {
    const isDmChannel = message.channel.type === ChannelType.DM;

    if (message.author.bot || isDmChannel) {
      return;
    }

    const userId = message.author.id;
    const guildId = message.guildId;
    const timeForExp = this.isTimeForExp(guildId, userId);

    if (!timeForExp) {
      return;
    }

    this.lastMessages[guildId][userId] = Date.now();

    const expGained = getRandomInt(MIN_EXP_EARNED, MAX_EXP_EARNED);
    const gemsGained = getRandomInt(MIN_GEMS_EARNED, MAX_GEMS_EARNED);

    this.increaseExp(message, userId, guildId, expGained);

    await this.bot.addToUserBalance(message, userId, gemsGained);
  }
}
