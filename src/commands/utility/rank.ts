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
  rank: string;
}

export default class extends Command {
  constructor() {
    super({
      name: "rank",
      description: "Get your current rank.",
      usage: "<prefix>rank",
      type: "utility",
      groupOnly: true,
      cooldown: 3000,
    });
  }

  private getRankInfo(info: PlayerInfo) {
    const rankTxt = `Rank: ${info.rank}\n`;
    const levelTxt = `Level: ${info.level}\n`;
    const expTxt = `Level Exp: ${info.remainingExp}/${info.levelExp}\nTotal Exp: ${info.totalExp}`;

    return `Rank for ${info.name}\n${rankTxt}${levelTxt}${expTxt}`;
  }

  async action(message: Message): Promise<void> {
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
        return message.reply(
          "You aren't ranked yet. Send some messages first, then try again."
        );
      }

      const level = LevelManager.getLevelFromExp(score.exp);

      let xp = 0;
      for (let i = 0; i < level; i++) {
        xp += LevelManager.levelToExp(i);
      }

      const rank =
        playerSorted.findIndex((p) => p.userId === message.user.id) + 1;
      const info: PlayerInfo = {
        name: message.user.display_name,
        totalExp: score.exp,
        levelExp: LevelManager.levelToExp(level),
        remainingExp: score.exp - xp,
        level,
        rank: `${rank}/${scores.length}`,
      };

      content.insertCodeBlock(this.getRankInfo(info));

      return message.reply(content);
    } catch {
      return message.reply(`An error occured while fetching rank.`);
    }
  }
}
