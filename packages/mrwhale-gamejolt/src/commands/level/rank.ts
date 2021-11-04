import { getLevelFromExp, getRemainingExp, levelToExp } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { LevelManager } from "../../client/managers/level-manager";
import { PlayerInfo } from "../../types/player-info";
import { createPlayerCard } from "../../image/create-player-card";
import { CardTheme } from "../../types/card-theme";
import { uploadImage } from "../../image/upload-image";

export default class extends GameJoltCommand {
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

  async action(message: Message): Promise<void | Message> {
    try {
      const user = message.firstMentionOrAuthor;
      const responseMsg = await message.reply("Processing please wait...");
      const score = await LevelManager.getUserScore(message.room_id, user.id);
      const scores = await LevelManager.getScores(message.room_id);
      const playerSorted = scores.sort((a, b) => a.exp - b.exp).reverse();

      if (!score) {
        return message.reply(
          user.id === message.user.id
            ? "You aren't ranked yet. Send some messages first, then try again."
            : "This user is not ranked."
        );
      }

      const level = getLevelFromExp(score.exp);
      const rank = playerSorted.findIndex((p) => p.userId === user.id) + 1;
      const info: PlayerInfo = {
        user,
        totalExp: score.exp,
        levelExp: levelToExp(level),
        remainingExp: getRemainingExp(score.exp),
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
      return uploadImage(canvas, responseMsg);
    } catch {
      return message.reply(`An error occured while fetching rank.`);
    }
  }
}
