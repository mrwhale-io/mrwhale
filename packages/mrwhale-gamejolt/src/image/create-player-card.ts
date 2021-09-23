import axios from "axios";
import { createCanvas, Canvas, loadImage } from "canvas";

import { PlayerInfo } from "../types/player-info";
import { applyText } from "../util/apply-text";
import { ProgressBar } from "./progress-bar";
import { CardTheme } from '../types/card-theme';

/**
 * Draws a user ranking card.
 * @param player The player info.
 * @param theme The card theme.
 */
export async function createPlayerCard(player: PlayerInfo, theme: CardTheme): Promise<Canvas> {
  const canvas = createCanvas(920, 250);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = theme.fillColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player username.
  ctx.font = applyText(canvas, `@${player.user.username}`);
  ctx.fillStyle = theme.primaryTextColor;
  ctx.fillText(
    `@${player.user.username}`,
    canvas.width / 3.5,
    canvas.height / 1.7
  );

  // Draw player rank
  ctx.font = theme.font;
  ctx.fillStyle = theme.primaryTextColor;
  ctx.fillText(`RANK #${player.rank}`, canvas.width / 1.8, canvas.height / 3.5);

  // Draw player level
  ctx.font = theme.font;
  ctx.fillStyle = theme.secondaryTextColor;
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
    color: theme.progressColor,
    backgroundColor: theme.progressFillColor,
  });
  progressBar.draw();

  // Draw player exp
  ctx.font = theme.font;
  ctx.fillStyle = theme.primaryTextColor;
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
