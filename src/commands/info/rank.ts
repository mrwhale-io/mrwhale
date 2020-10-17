import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { Score } from "../../database/entity/score";
import { Database } from "../../database/database";
import { LevelManager } from "../../managers/level-manager";

interface PlayerInfo {
  name: string;
  totalExp: number;
  levelExp: number;
  remainingExp: number;
  level: number;
  rank: number | string;
}

export default class extends Command {
  constructor() {
    super({
      name: "rank",
      description: "Get your current rank.",
      usage: "<prefix>rank",
      type: "info",
      groupOnly: true,
    });
  }

  private getRankInfo(scores: Score[], info: PlayerInfo) {
    const rankTxt = `Rank: ${info.rank}/${scores.length}\n`;
    const levelTxt = `Level: ${info.level}\n`;
    const expTxt = `Level Exp: ${info.remainingExp}/${info.levelExp}\nTotal Exp: ${info.totalExp}`;

    return `Rank for ${info.name}\n${rankTxt}${levelTxt}${expTxt}`;
  }

  async action(message: Message) {
    const content = new Content();
    try {
      const score: Score = await Database.connection
        .getRepository(Score)
        .findOne({ roomId: message.room_id, userId: message.user.id });

      const scores: Score[] = await Database.connection
        .getRepository(Score)
        .find({ roomId: message.room_id });

      const playerSorted = scores.sort((a, b) => a.exp - b.exp).reverse();

      if (!score) {
        const info: PlayerInfo = {
          name: message.user.display_name,
          totalExp: 0,
          levelExp: 0,
          remainingExp: 0,
          level: 0,
          rank: "n/a",
        };
        const contentText = content.state.schema.text(
          this.getRankInfo(scores, info)
        );
        const node = content.schema.nodes.codeBlock.create({}, [contentText]);
        content.insertNewNode(node);

        return message.reply(content);
      }

      const level = LevelManager.getLevelFromExp(score.exp);

      let xp = 0;
      for (let i = 0; i < level; i++) {
        xp += LevelManager.levelToExp(i);
      }

      const info: PlayerInfo = {
        name: message.user.display_name,
        totalExp: score.exp,
        levelExp: LevelManager.levelToExp(level),
        remainingExp: score.exp - xp,
        level,
        rank: playerSorted.findIndex((p) => p.userId === message.user.id) + 1,
      };

      const contentText = content.state.schema.text(
        this.getRankInfo(playerSorted, info)
      );
      const node = content.schema.nodes.codeBlock.create({}, [contentText]);
      content.insertNewNode(node);

      return message.reply(content);
    } catch {
      return message.reply(`An error occured while fetching rank.`);
    }
  }
}
