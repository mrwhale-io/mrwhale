import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  User,
} from "discord.js";
import * as sequelize from "sequelize";

import { code, getLevelFromExp } from "@mrwhale-io/core";
import { Score } from "../database/models/score";
import { EMBED_COLOR } from "../constants";

const HIGHSCORE_PAGE_LIMIT = 10;
const HIGHSCORE_MAX_LIMIT = 100;

export interface ScoreResult {
  scores: MappedScores[];
  pages: number;
  total: number;
  offset: number;
}

export interface MappedScores {
  exp: number;
  user: User;
  level: number;
}

export async function createLeaderboardTable(
  scoreResult: ScoreResult,
  page: number,
  title: string
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(title)
    .setTimestamp()
    .setFooter({ text: `Page ${page}/${scoreResult.pages}` });
  if (scoreResult.scores.length < 1) {
    return embed.setDescription("No one is ranked.");
  }

  scoreResult.scores = scoreResult.scores.sort((a, b) => b.exp - a.exp);

  let table = "Here are the top players for this leaderboard.\n\n";
  for (let i = 0; i < scoreResult.scores.length; i++) {
    const score = scoreResult.scores[i];
    const place = i + scoreResult.offset;
    table += `${code(`#${place + 1}`)} | **@${score.user.username}** • *Exp: ${
      score.exp
    } (Level ${score.level})*\n\n`;
  }

  return embed.setDescription(table);
}

export async function getGuildScores(
  message: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  const scoreCount = (
    await Score.findAll({
      where: {
        guildId: message.guildId,
      },
      limit: HIGHSCORE_MAX_LIMIT,
    })
  ).length;
  const pages = Math.ceil(scoreCount / HIGHSCORE_PAGE_LIMIT);
  const offset = HIGHSCORE_PAGE_LIMIT * (page - 1);
  const scores = await Score.findAll({
    where: {
      guildId: message.guildId,
    },
    order: [["exp", "DESC"]],
    offset,
    limit: HIGHSCORE_PAGE_LIMIT,
  });
  let mappedScores: MappedScores[] = [];
  for (let score of scores) {
    mappedScores.push({
      exp: score.exp,
      user: message.client.users.cache.has(score.userId)
        ? message.client.users.cache.get(score.userId)
        : await message.client.users.fetch(score.userId),
      level: getLevelFromExp(score.exp),
    });
  }

  return { scores: mappedScores, total: scoreCount, pages, offset };
}

export async function getGlobalScores(
  message: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  const sum: any = sequelize.fn("sum", sequelize.col("exp"));
  const scoreCount = (
    await Score.findAll({
      group: ["Score.userId"],
      limit: HIGHSCORE_MAX_LIMIT,
    })
  ).length;
  const pages = Math.ceil(scoreCount / HIGHSCORE_PAGE_LIMIT);
  const offset = HIGHSCORE_PAGE_LIMIT * (page - 1);
  const scores = await Score.findAll({
    attributes: ["userId", [sum, "total"]],
    group: ["Score.userId"],
    order: [[sum, "DESC"]],
    offset,
    limit: HIGHSCORE_PAGE_LIMIT,
  });
  let mappedScores: MappedScores[] = [];
  for (let score of scores) {
    mappedScores.push({
      exp: score.getDataValue("total"),
      user: message.client.users.cache.has(score.userId)
        ? message.client.users.cache.get(score.userId)
        : await message.client.users.fetch(score.userId),
      level: getLevelFromExp(score.getDataValue("total")),
    });
  }

  return { scores: mappedScores, total: scoreCount, pages, offset };
}
