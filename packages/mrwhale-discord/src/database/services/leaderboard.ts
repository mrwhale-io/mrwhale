import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Message,
  User,
} from "discord.js";
import * as sequelize from "sequelize";

import { code, getLevelFromExp } from "@mrwhale-io/core";
import { Score } from "../models/score";
import {
  EMBED_COLOR,
  HIGHSCORE_MAX_LIMIT,
  HIGHSCORE_PAGE_LIMIT,
} from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { MappedScores } from "../../types/scores/mapped-scores";
import { getAllFishCaughtByGuild } from "./fish-caught";
import { FishCaughtInstance } from "../models/fish-caught";

interface LeaderboardOptions {
  scoreResult: ScoreResult;
  page: number;
  title: string;
  isGlobal: boolean;
}

/**
 * Creates a generic embed for the leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param leaderboardOptions The options for the leaderboard.
 */
export async function createLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  leaderboardOptions: LeaderboardOptions
): Promise<EmbedBuilder> {
  const { title, scoreResult, page, isGlobal } = leaderboardOptions;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(title)
    .setTimestamp()
    .setFooter({ text: `Page ${page}/${scoreResult.pages}` });

  if (scoreResult.scores.length < 1) {
    return embed.setDescription("No one is ranked.");
  }

  if (!isGlobal) {
    embed.setAuthor({
      name: interactionOrMessage.guild.name,
      iconURL: interactionOrMessage.guild.iconURL(),
    });
  }

  return embed;
}

/**
 * Creates an embed for the exp leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function createExpLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean = false
): Promise<EmbedBuilder> {
  const title = isGlobal
    ? "Top Global Levels"
    : `Top Levels in ${interactionOrMessage.guild.name}`;
  const embed = await createLeaderboardTable(interactionOrMessage, {
    scoreResult,
    page,
    title,
    isGlobal,
  });
  let table = "Here are the top players for this leaderboard.\n\n";
  for (let i = 0; i < scoreResult.scores.length; i++) {
    const score = scoreResult.scores[i];
    const place = i + scoreResult.offset + 1;
    table += `${code(`#${place}`)} ${getPlaceEmoji(place)} | @${
      score.user.username
    } • **Exp: ${score.exp} (Level ${score.level})**\n`;
  }

  return embed.setDescription(table);
}

/**
 * Creates an embed for the fish caught leaderboard table.
 * @param interactionOrMessage The discord command interaction or message.
 * @param scoreResult Contains a list of scores results.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function createFishCaughtLeaderboardTable(
  interactionOrMessage: Message | ChatInputCommandInteraction,
  scoreResult: ScoreResult,
  page: number,
  isGlobal: boolean = false
): Promise<EmbedBuilder> {
  const title = isGlobal
    ? "Fish Caught"
    : `Fish Caught in ${interactionOrMessage.guild.name}`;
  const embed = await createLeaderboardTable(interactionOrMessage, {
    scoreResult,
    page,
    title,
    isGlobal,
  });
  let table = "Here are the top players for this leaderboard.\n\n";
  for (let i = 0; i < scoreResult.scores.length; i++) {
    const score = scoreResult.scores[i];
    const place = i + scoreResult.offset + 1;
    table += `${code(`#${place}`)} ${getPlaceEmoji(place)} | @${
      score.user.username
    } • **${score.exp}**\n`;
  }

  return embed.setDescription(table);
}

/**
 * Get a leaderboard table embed of the given type.
 * @param interactionOrMessage The discord command interaction or message.
 * @param type The type of leaderboard to get.
 * @param page The page number.
 * @param isGlobal Whether this is a global leaderboard or not.
 */
export async function getLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  type: string,
  page: number,
  isGlobal: boolean = false
): Promise<{ table: EmbedBuilder; pages: number }> {
  switch (type) {
    case "exp":
      const expScores = isGlobal
        ? await getGlobalExpScores(interactionOrMessage, page)
        : await getGuildExpScores(interactionOrMessage, page);

      return {
        table: await createExpLeaderboardTable(
          interactionOrMessage,
          expScores,
          page,
          isGlobal
        ),
        pages: expScores.pages,
      };

    case "fishcaught":
      const fishCaughtScores = isGlobal
        ? await getGlobalFishCaughtScores(interactionOrMessage, page)
        : await getGuildFishCaughtScores(interactionOrMessage, page);

      return {
        table: await createFishCaughtLeaderboardTable(
          interactionOrMessage,
          fishCaughtScores,
          page,
          isGlobal
        ),
        pages: fishCaughtScores.pages,
      };
  }
}

export async function getGuildExpScores(
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

export async function getGlobalExpScores(
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

export async function getGuildFishCaughtScores(
  message: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  const guildId = message.guildId;

  try {
    const { count, rows: scores } = await getAllFishCaughtByGuild(
      guildId,
      page
    );

    const scoreSumTotals = countFishCaught(scores);
    const pages = Math.ceil(count / HIGHSCORE_PAGE_LIMIT);
    const offset = HIGHSCORE_PAGE_LIMIT * (page - 1);

    const mappedScoresPromises: Promise<MappedScores>[] = Object.entries(
      scoreSumTotals
    ).map(async ([userId, quantity]) => {
      const user = await fetchUser(message.client, userId);
      return {
        exp: quantity,
        user: user ? user : null,
      };
    });

    const mappedScores = await Promise.all(mappedScoresPromises);

    return { scores: mappedScores, total: count, pages, offset };
  } catch {
    throw new Error("Failed to fetch fish caught scores.");
  }
}

async function fetchUser(client: Client, userId: string): Promise<User | null> {
  try {
    if (client.users.cache.has(userId)) {
      return client.users.cache.get(userId);
    } else {
      return await client.users.fetch(userId);
    }
  } catch {
    return null;
  }
}

export async function getGlobalFishCaughtScores(
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

function getPlaceEmoji(place: number): string {
  if (place === 1) {
    return "🥇";
  } else if (place === 2) {
    return "🥈";
  } else if (place === 3) {
    return "🥉";
  }

  return "";
}

function countFishCaught(
  fishCaught: FishCaughtInstance[]
): Record<string, number> {
  return fishCaught.reduce((score, { userId, quantity }) => {
    score[userId] = score[userId] || 0;
    score[userId] += quantity;
    return score;
  }, {});
}
