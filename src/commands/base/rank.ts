import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { Score } from "../../database/entity/score";
import { Database } from "../../database/database";
import { LevelManager } from "../../managers/level-manager";

export default class extends Command {
  constructor() {
    super({
      name: "rank",
      description: "Get your current rank.",
      usage: "<prefix>rank",
    });
  }

  async action(message: Message) {
    const content = new Content();
    try {
      const score: Score = await Database.connection
        .getRepository(Score)
        .findOne({ roomId: message.room_id, userId: message.user.id });

      if (!score) {
        content.insertText(`You are unranked.`);

        return message.reply(content);
      }

      const scores: Score[] = await Database.connection
        .getRepository(Score)
        .find({ roomId: message.room_id });

      const level = LevelManager.getLevelFromExp(score.exp);

      let xp = 0;
      for (let i = 0; i < level; i++) {
        xp += LevelManager.levelToExp(i);
      }

      const playerSorted = scores.sort((a, b) => a.exp - b.exp).reverse();

      const info = {
        totalExp: score.exp,
        levelExp: LevelManager.levelToExp(level),
        remainingExp: score.exp - xp,
        level,
        rank: playerSorted.findIndex((p) => p.userId === message.user.id) + 1,
      };

      const rankTxt = `Rank: ${info.rank}/${playerSorted.length}\n`;
      const levelTxt = `Level: ${info.level}\n`;
      const expTxt = `Level Exp: ${info.remainingExp}/${info.levelExp}\nTotal Exp: ${info.totalExp}`;

      const contentText = content.state.schema.text(
        `Rank for ${message.user.display_name}\n${rankTxt}${levelTxt}${expTxt}`
      );
      const node = content.schema.nodes.codeBlock.create({}, [contentText]);
      content.insertNewNode(node);

      return message.reply(content);
    } catch {
      content.insertText(`An error occured while fetching rank.`);

      return message.reply(content);
    }
  }
}
