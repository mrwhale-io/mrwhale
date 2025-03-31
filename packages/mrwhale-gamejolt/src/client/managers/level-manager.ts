import {
  getLevelFromExp,
  getRandomInt,
  ListenerDecorators,
} from "@mrwhale-io/core";
import { Message, Content } from "@mrwhale-io/gamejolt-client";

import { GameJoltBotClient } from "../gamejolt-bot-client";
import { Score, ScoreInstance } from "../../database/models/score";

const { on, registerListeners } = ListenerDecorators;

const TIME_FOR_EXP = 6e4;

interface MessageMap {
  [roomId: number]: { [user: number]: number };
}

export class LevelManager {
  private lastMessages: MessageMap;

  constructor(private bot: GameJoltBotClient) {
    this.lastMessages = {};
    registerListeners(this.bot.client, this);
  }

  /**
   * Checks whether levels are enabled in the room.
   *
   * @param roomId The identifier of the room.
   */
  async isLevelsEnabled(roomId: number): Promise<boolean> {
    if (!this.bot.roomSettings.has(roomId)) {
      return true;
    }

    const settings = this.bot.roomSettings.get(roomId);

    return await settings.get("levels", true);
  }

  /**
   * Get room scores.
   * @param roomId The room id to get scores for.
   */
  static async getScores(roomId: number): Promise<ScoreInstance[]> {
    return await Score.findAll<ScoreInstance>({
      where: {
        roomId,
      },
    });
  }

  /**
   * Get user score in a room.
   * @param roomId The room id to get scores for.
   * @param userId The user id to get scores for.
   */
  static async getUserScore(
    roomId: number,
    userId: number
  ): Promise<ScoreInstance> {
    return await Score.findOne({
      where: {
        roomId,
        userId,
      },
    });
  }

  private isTimeForExp(roomId: number, userId: number) {
    if (!this.lastMessages[roomId]) {
      this.lastMessages[roomId] = {};
    }

    const lastMessageTimestamp = this.lastMessages[roomId][userId] || -Infinity;

    return Date.now() - lastMessageTimestamp >= TIME_FOR_EXP;
  }

  private async getScore(userId: number, roomId: number) {
    let score = await LevelManager.getUserScore(roomId, userId);

    if (!score) {
      score = Score.build({
        userId,
        roomId,
        exp: 0,
      });
    }

    return score;
  }

  @on("message")
  protected async onMessage(message: Message): Promise<void> {
    const isEnabled = await this.isLevelsEnabled(message.room_id);
    const pmUser = this.bot.friendsList.getByRoom(message.room_id);

    if (message.user.id === this.bot.client.userId || pmUser || !isEnabled) {
      return;
    }

    const blockedUsersIds = this.bot.client.blockedUsers.map(
      (blocked) => blocked.user.id
    );

    if (blockedUsersIds && blockedUsersIds.includes(message.user.id)) {
      return;
    }

    const timeForExp = this.isTimeForExp(message.room_id, message.user.id);

    if (!timeForExp) {
      return;
    }

    this.lastMessages[message.room_id][message.user.id] = Date.now();

    const expGained = getRandomInt(15, 25);
    const score = await this.getScore(message.user.id, message.room_id);
    const level = getLevelFromExp(score.exp);

    score.exp += expGained;
    score.save();

    const newLevel = getLevelFromExp(score.exp);

    if (newLevel > level) {
      this.bot.chat.sendMessage(
        `Congrats @${message.user.username}, you just advanced to level ${newLevel}!`,
        message.room_id
      );
    }
  }
}
