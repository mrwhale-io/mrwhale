import { Message, Content } from "@mrwhale-io/gamejolt-client";
import * as fs from "fs";
import { file } from "tmp-promise";

import { Command } from "../command";
import { Score } from "../../database/entity/score";
import { Database } from "../../database/database";
import { LevelManager } from "../../managers/level-manager";
import { PlayerInfo } from "../../types/player-info";
import { createPlayerCard } from "../../image/create-player-card";
import { CardTheme } from "../../types/card-theme";

export default class extends Command {
  constructor() {
    super({
      name: "rank",
      description: "Get your current rank.",
      usage: "<prefix>rank",
      type: "level",
      groupOnly: true,
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      let user = message.mentions[0];
      if (!user) {
        user = message.user;
      }

      const content = new Content();
      const score: Score = await Database.connection
        .getRepository(Score)
        .findOne({ roomId: message.room_id, userId: user.id });

      const scores: Score[] = await Database.connection
        .getRepository(Score)
        .find({ roomId: message.room_id });

      const playerSorted = scores.sort((a, b) => a.exp - b.exp).reverse();

      if (!score) {
        return message.reply(
          user.id === message.user.id
            ? "You aren't ranked yet. Send some messages first, then try again."
            : "This user is not ranked."
        );
      }

      const level = LevelManager.getLevelFromExp(score.exp);

      let xp = 0;
      for (let i = 0; i < level; i++) {
        xp += LevelManager.levelToExp(i);
      }

      const rank = playerSorted.findIndex((p) => p.userId === user.id) + 1;
      const info: PlayerInfo = {
        user,
        totalExp: score.exp,
        levelExp: LevelManager.levelToExp(level),
        remainingExp: score.exp - xp,
        level,
        rank,
      };
      const theme: CardTheme = {
        fillColor: "#111015",
        primaryTextColor: "#ffffff",
        secondaryTextColor: "#ccff00",
        progressFillColor: "#201d27",
        progressColor: "#ff3fac",
        font: "34px sans-serif",
      };

      const canvas = await createPlayerCard(info, theme);
      const { path, cleanup } = await file({ postfix: ".png" });
      const out = fs.createWriteStream(path);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        const mediaItem = await this.client.chat.uploadFile(
          fs.createReadStream(path),
          message.room_id
        );

        await content.insertImage(mediaItem);
        message.reply(content);

        cleanup();
      });
    } catch {
      return message.reply(`An error occured while fetching rank.`);
    }
  }
}
