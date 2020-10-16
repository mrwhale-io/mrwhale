import { Message, Content } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { ListenerDecorators } from "../util/listener-decorators";
import { Database } from "../database/database";
import { Score } from "../database/entity/score";

const { on, registerListeners } = ListenerDecorators;

interface MessageMap {
  [roomId: number]: { [user: number]: number };
}

export class LevelManager {
  private lastMessages: MessageMap;
  constructor(private client: BotClient) {
    this.lastMessages = {};
    registerListeners(this.client, this);
  }

  /**
   * Convert level to experience.
   * @param level The level to calculate from.
   */
  static levelToExp(level: number): number {
    const base = 100;
    const multiplier = 5;
    const increasePerLevel = 50;

    return multiplier * Math.pow(level, 2) + increasePerLevel * level + base;
  }

  /**
   * Calculate level from experience.
   * @param exp The experience to calculate level from.
   */
  static getLevelFromExp(exp: number): number {
    let level = 0;
    let remainingExp = exp;

    while (remainingExp >= LevelManager.levelToExp(level)) {
      remainingExp -= LevelManager.levelToExp(level);
      level++;
    }

    return level;
  }

  private getRandomExp(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private isTimeForExp(roomId: number, userId: number) {
    const timeForExp = 6e4;

    if (!this.lastMessages[roomId]) {
      this.lastMessages[roomId] = {};
    }

    const lastMessageTimestamp = this.lastMessages[roomId][userId] || -Infinity;

    return Date.now() - lastMessageTimestamp >= timeForExp;
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
  protected async onMessage(message: Message) {
    if (message.user.id === this.client.userId) {
      return;
    }

    const timeForExp = this.isTimeForExp(message.room_id, message.user.id);

    console.log(LevelManager.getLevelFromExp(120));

    if (!timeForExp) {
      return;
    }

    this.lastMessages[message.room_id][message.user.id] = Date.now();

    const expGained = this.getRandomExp(15, 25);
    const score = await this.getScore(message.user.id, message.room_id);
    const level = LevelManager.getLevelFromExp(score.exp);

    console.log(score);
    console.log(LevelManager.getLevelFromExp(level));

    score.exp += expGained;
    Database.connection.getRepository(Score).save(score);

    const newLevel = LevelManager.getLevelFromExp(score.exp);

    if (newLevel > level) {
      const content = new Content();

      content.insertText(
        `Congrats ${message.user.display_name}, you just advanced to level ${newLevel}!`
      );

      return message.reply(content);
    }
  }
}
