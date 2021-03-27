import { Message, User, Content } from "@mrwhale-io/gamejolt";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import { file } from "tmp-promise";

import { Command } from "../command";
import { Score } from "../../database/entity/score";
import { Database } from "../../database/database";
import { LevelManager } from "../../managers/level-manager";
import { ProgressBar } from "../../image/progress-bar";

interface PlayerInfo {
  user: User;
  totalExp: number;
  levelExp: number;
  remainingExp: number;
  level: number;
  rank: number;
}

const applyText = (canvas, text) => {
  const ctx = canvas.getContext("2d");

  // Declare a base size of the font
  let fontSize = 36;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `${(fontSize -= 2)}px sans-serif`;
  } while (ctx.measureText(text).width > canvas.width - 528);

  // Return the result to use in the actual canvas
  return ctx.font;
};

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

  private async createCard(player: PlayerInfo) {
    const canvas = createCanvas(920, 250);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#111015";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player username.
    ctx.font = applyText(canvas, `@${player.user.username}`);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `@${player.user.username}`,
      canvas.width / 3.5,
      canvas.height / 1.7
    );

    // Draw player rank
    ctx.font = "34px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `RANK #${player.rank}`,
      canvas.width / 1.8,
      canvas.height / 3.5
    );

    // Draw player level
    ctx.font = "34px sans-serif";
    ctx.fillStyle = "#ccff00";
    ctx.fillText(
      `LEVEL ${player.level}`,
      canvas.width / 1.3,
      canvas.height / 3.5
    );

    // Draw EXP progress bar
    const progressBar = new ProgressBar({
      x: canvas.width / 3.5,
      y: canvas.height / 1.5,
      width: canvas.width - 300,
      height: 50,
      canvas,
      percentage: Math.floor((player.remainingExp / player.levelExp) * 100),
      color: "#ff3fac",
    });
    progressBar.draw();

    // Draw player rank
    ctx.font = "34px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `${player.remainingExp}/${player.levelExp} EXP`,
      canvas.width / 1.4,
      canvas.height / 1.7
    );

    // Draw user avatar.
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatarFile = await axios.get(player.user.img_avatar, {
      responseType: "arraybuffer",
    });
    const avatar = await loadImage(avatarFile.data);
    ctx.drawImage(avatar, 25, 25, 200, 200);

    return canvas;
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

      const canvas = await this.createCard(info);
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
