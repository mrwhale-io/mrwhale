import { getLevelFromExp, getRandomInt, ListenerDecorators } from "@mrwhale-io/core";
import { Message, Content } from "@mrwhale-io/gamejolt-client";

import { GameJoltBotClient } from "../gamejolt-bot-client";
import { Database } from "../../database/database";
import { Score } from "../../database/entity/score";

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
   * Get room scores.
   * @param roomId The room id to get scores for.
   */
  static async getScores(roomId: number): Promise<Score[]> {
    return await Database.connection.getRepository(Score).find({ roomId });
  }

  /**
   * Get user score in a room.
   * @param roomId The room id to get scores for.
   * @param userId The user id to get scores for.
   */
  static async getUserScore(roomId: number, userId: number): Promise<Score> {
    return await Database.connection
      .getRepository(Score)
      .findOne({ roomId, userId });
  }

  private isTimeForExp(roomId: number, userId: number) {
    if (!this.lastMessages[roomId]) {
      this.lastMessages[roomId] = {};
    }

    const lastMessageTimestamp = this.lastMessages[roomId][userId] || -Infinity;

    return Date.now() - lastMessageTimestamp >= TIME_FOR_EXP;
  }

  private async getScore(userId: number, roomId: number) {
    let score: Score = await Database.connection
      .getRepository(Score)
      .findOne({ roomId, userId });

    if (!score) {
      score = new Score();
      score.userId = userId;
      score.roomId = roomId;
      score.exp = 0;
    }

    return score;
  }

  @on("message")
  protected async onMessage(message: Message): Promise<void> {
    if (
      message.user.id === this.bot.client.userId ||
      this.bot.client.chat.friendsList.getByRoom(message.room_id) ||
      !this.bot.settings.get(message.room_id, "levels", true)
    ) {
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
    Database.connection.getRepository(Score).save(score);

    const newLevel = getLevelFromExp(score.exp);

    if (newLevel > level) {
      const content = new Content().insertText(
        `Congrats @${message.user.username}, you just advanced to level ${newLevel}!`
      );

      this.bot.client.chat.sendMessage(content, message.room_id);
    }
  }
}
