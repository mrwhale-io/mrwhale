import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { Score } from "../../database/entity/score";
import { Database } from "../../database/database";
import { LevelManager } from "../../managers/level-manager";
import { InfoBuilder } from "../../util/info-builder";

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

  async action(message: Message): Promise<Message> {
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

      const response = new InfoBuilder()
        .addField("Rank For", `${info.name}`)
        .addField("Rank", info.rank)
        .addField("Level", `${info.level}`)
        .addField("Level Exp", `${info.remainingExp}/${info.levelExp}`)
        .addField("Total Exp", `${info.totalExp}`)
        .build();

      return message.reply(response);
    } catch {
      return message.reply(`An error occured while fetching rank.`);
    }
  }
}
