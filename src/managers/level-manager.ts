import { Message, Content } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { ListenerDecorators } from "../util/listener-decorators";
import { Database } from "../database/database";
import { Score } from "../database/entity/score";
import { getRandomInt } from "../util/get-random-int";

const { on, registerListeners } = ListenerDecorators;

const TIME_FOR_EXP = 6e4;
const LEVEL_BASE = 100;
const LEVEL_MULTIPLIER = 5;
const INCREASE_PER_LEVEL = 50;

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
    return (
      LEVEL_MULTIPLIER * Math.pow(level, 2) +
      INCREASE_PER_LEVEL * level +
      LEVEL_BASE
    );
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
      message.user.id === this.client.userId ||
      this.client.chat.friendsList.getByRoom(message.room_id) ||
      !this.client.settings.get(message.room_id, "levels", true)
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
    const level = LevelManager.getLevelFromExp(score.exp);

    score.exp += expGained;
    Database.connection.getRepository(Score).save(score);

    const newLevel = LevelManager.getLevelFromExp(score.exp);

    if (newLevel > level) {
      const content = new Content().insertText(
        `Congrats @${message.user.username}, you just advanced to level ${newLevel}!`
      );

      this.client.chat.sendMessage(content, message.room_id);
    }
  }
}
