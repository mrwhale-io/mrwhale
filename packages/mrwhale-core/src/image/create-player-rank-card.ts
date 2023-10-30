import axios from "axios";
import {
  createCanvas,
  Canvas,
  CanvasRenderingContext2D,
  loadImage,
} from "canvas";

import { PlayerInfo } from "../types/player-info";
import { applyText } from "../util/apply-text";
import { ProgressBar } from "./progress-bar";
import { RankCardTheme } from "../types/rank-card-theme";

const RANK_CARD_WIDTH = 800;
const RANK_CARD_HEIGHT = 200;

interface RankCardOptions {
  player: PlayerInfo;
  theme: RankCardTheme;
  defaultTheme: RankCardTheme;
}

/**
 * Draws a user's ranking card.
 * @param rankCardOptions The rank card options.
 */
export async function createPlayerRankCard(
  rankCardOptions: RankCardOptions
): Promise<Canvas> {
  const { player, theme, defaultTheme } = rankCardOptions;
  const canvas = createCanvas(RANK_CARD_WIDTH, RANK_CARD_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Create the background
  ctx.fillStyle = theme.fillColour || defaultTheme.fillColour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRankInfo(canvas, ctx, rankCardOptions);

  drawProgressBar(canvas, rankCardOptions);

  drawExperience(canvas, ctx, rankCardOptions);

  await drawAvatar(ctx, player);

  return canvas;
}

function drawProgressBar(canvas: Canvas, rankCardOptions: RankCardOptions) {
  const { player, theme, defaultTheme } = rankCardOptions;
  const progressBar = new ProgressBar({
    x: canvas.width / 3.5,
    y: canvas.height / 1.5,
    width: canvas.width - 300,
    height: 40,
    canvas,
    percentage: Math.floor((player.remainingExp / player.levelExp) * 100),
    color: theme.progressColour || defaultTheme.progressColour,
    backgroundColor:
      theme.progressFillColour || defaultTheme.progressFillColour,
  });
  progressBar.draw();
}

async function drawAvatar(ctx: CanvasRenderingContext2D, player: PlayerInfo) {
  ctx.beginPath();
  ctx.arc(100, 100, 75, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatarFile = await axios.get(player.avatarUrl, {
    responseType: "arraybuffer",
  });
  const avatar = await loadImage(avatarFile.data);
  ctx.drawImage(avatar, 25, 25, 150, 150);
}

function drawRankInfo(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  rankCardOptions: RankCardOptions
) {
  const { player, theme, defaultTheme } = rankCardOptions;

  // Draw player username
  ctx.font = applyText(
    canvas,
    36,
    canvas.width - 528,
    `@${player.username}`,
    theme.font || defaultTheme.font
  );
  ctx.fillStyle = theme.secondaryTextColour || defaultTheme.secondaryTextColour;
  ctx.fillText(`@${player.username}`, canvas.width / 3.5, canvas.height / 1.7);

  // Draw player rank
  ctx.font = `28px ${theme.font || defaultTheme.font}`;
  ctx.fillStyle = theme.primaryTextColour || defaultTheme.primaryTextColour;
  ctx.fillText(`RANK #${player.rank}`, canvas.width / 1.8, canvas.height / 3.5);

  // Draw player level
  ctx.font = `28px ${theme.font || defaultTheme.font}`;
  ctx.fillStyle = theme.secondaryTextColour || defaultTheme.secondaryTextColour;
  ctx.fillText(
    `LEVEL ${player.level}`,
    canvas.width / 1.3,
    canvas.height / 3.5
  );
}

function drawExperience(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  rankCardOptions: RankCardOptions
) {
  const { player, theme, defaultTheme } = rankCardOptions;
  ctx.font = `28px ${theme.font || defaultTheme.font}`;
  ctx.fillStyle = theme.primaryTextColour || defaultTheme.primaryTextColour;
  ctx.fillText(
    `${player.remainingExp}/${player.levelExp} EXP`,
    canvas.width / 1.4,
    canvas.height / 1.7
  );
}
