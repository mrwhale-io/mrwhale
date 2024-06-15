import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import * as sequelize from "sequelize";
import * as NodeCache from "node-cache";

import { getLevelFromExp } from "@mrwhale-io/core";
import { Score } from "../models/score";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { MappedScores } from "../../types/scores/mapped-scores";
import { getAllFishCaughtByGuild } from "./fish-caught";
import { FishCaught, FishCaughtInstance } from "../models/fish-caught";
import { fetchUser } from "./user";
import {
  createExpLeaderboardTable,
  createFishCaughtLeaderboardTable,
} from "../../util/embed/leaderboard-table-helpers";

const leaderboardCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

/**
 * Retrieves a leaderboard table embed of the specified type.
 *
 * This function fetches and constructs an embed for a leaderboard of the given type.
 * It supports both global and guild-specific leaderboards, and the results are paginated.
 *
 * @param interactionOrMessage The Discord command interaction or message.
 * @param type The type of leaderboard to retrieve. Supported types are "exp" and "fishcaught".
 * @param page The page number to retrieve.
 * @param isGlobal Indicates whether to retrieve a global leaderboard or a guild-specific leaderboard. Defaults to false.
 * @returns A Promise that resolves to an object containing the embed table and the total number of pages.
 */
export async function getLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  type: string,
  page: number,
  isGlobal: boolean = false
): Promise<{ table: EmbedBuilder; pages: number }> {
  switch (type) {
    case "exp":
      return getExpLeaderboardTable(interactionOrMessage, page, isGlobal);

    case "fishcaught":
      return getFishCaughtLeaderboardTable(
        interactionOrMessage,
        page,
        isGlobal
      );
  }
}

/**
 * Retrieves the experience (EXP) scores for users in a specific guild, paginated.
 *
 * This function fetches and calculates the EXP scores for users within a specified guild.
 * It supports pagination to navigate through the scores and uses caching to store and
 * retrieve the results efficiently. The function first checks for cached data, and if not
 * found, it queries the database to fetch the total number of player scores, calculates the
 * total pages, and retrieves the EXP scores for the specified page. It then maps the user
 * IDs to user objects and constructs the final scores result.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param page The page number to fetch scores for.
 * @returns A Promise that resolves to a ScoreResult containing the scores, total count, pages, and offset.
 * @throws An error if the guild EXP scores could not be fetched.
 */
export async function getGuildExpScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const guildId = messageOrInteraction.guildId;
    const cacheKey = `topExpScores:${guildId}:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalPlayerScores = await Score.count({ where: { guildId } });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalPlayerScores / HIGHSCORE_PAGE_LIMIT);
  
    const scores = await Score.findAll({
      where: {
        guildId,
      },
      order: [["exp", "DESC"]],
      limit: HIGHSCORE_PAGE_LIMIT,
      offset: offset,
      raw: true,
    });

    async ([userId, quantity]) => {
      const user = await fetchUser(messageOrInteraction.client, userId);
      return {
        exp: quantity,
        user: user ? user : null,
      };
    };

    const mappedScoresPromises = scores.map(async (score) => {
      const user = await fetchUser(messageOrInteraction.client, score.userId);
      return {
        exp: score.exp,
        level: getLevelFromExp(score.exp),
        user: user ? user : null,
      };
    });
    const mappedScores = await Promise.all(mappedScoresPromises);
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalPlayerScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch {
    throw new Error("Failed to fetch guild experience scores.");
  }
}

/**
 * Retrieves the global exp scores, paginated.
 *
 * This function fetches and calculates the exp scores across all guilds.
 * It supports pagination to navigate through the scores and uses caching to store and
 * retrieve the results efficiently. The function first checks for cached data, and if not
 * found, it queries the database to fetch the total number of users, calculates the total
 * pages, and retrieves the fish caught data for the specified page. It then maps the user
 * IDs to user objects and constructs the final scores result.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param page The page number to fetch scores for.
 * @returns A Promise that resolves to a ScoreResult containing the scores, total count, pages, and offset.
 * @throws An error if the global fish caught scores could not be fetched.
 */
export async function getGlobalExpScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const cacheKey = `topGlobalExpScores:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalPlayerScores = await Score.count({
      distinct: true,
      col: "userId",
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalPlayerScores / HIGHSCORE_PAGE_LIMIT);

    const scores = await Score.findAll({
      attributes: [
        "userId",
        [sequelize.fn("SUM", sequelize.col("exp")), "total"],
      ],
      group: ["userId"],
      order: [[sequelize.literal("total"), "DESC"]],
      limit: HIGHSCORE_PAGE_LIMIT,
      offset: offset,
      raw: true,
    });

    const mappedScoresPromises = scores.map(async (score) => {
      const user = await fetchUser(messageOrInteraction.client, score.userId);
      return {
        exp: score.total,
        level: getLevelFromExp(score.total),
        user: user ? user : null,
      };
    });
    const mappedScores = await Promise.all(mappedScoresPromises);
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalPlayerScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch {
    throw new Error("Failed to fetch global scores.");
  }
}

/**
 * Retrieves the fish caught scores for a specified guild, paginated.
 *
 * This function fetches and calculates the fish caught scores for a specified guild. It supports
 * pagination to navigate through the scores. It first fetches the fish caught data for the given
 * guild and page, then sums the fish quantities for each user. It also calculates the total number
 * of pages based on the count of scores and a defined limit per page. Finally, it maps the user IDs
 * to user objects and constructs the final scores result.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param page The page number to fetch scores for.
 * @returns A Promise that resolves to a ScoreResult containing the scores, total count, pages, and offset.
 * @throws An error if the fish caught scores could not be fetched.
 */
export async function getGuildFishCaughtScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  const guildId = messageOrInteraction.guildId;

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
      const user = await fetchUser(messageOrInteraction.client, userId);
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

/**
 * Retrieves the global fish caught scores, paginated.
 *
 * This function fetches and calculates the global fish caught scores across all guilds.
 * It supports pagination to navigate through the scores and uses caching to store and
 * retrieve the results efficiently. The function first checks for cached data, and if not
 * found, it queries the database to fetch the total number of users, calculates the total
 * pages, and retrieves the fish caught data for the specified page. It then maps the user
 * IDs to user objects and constructs the final scores result.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param page The page number to fetch scores for.
 * @returns A Promise that resolves to a ScoreResult containing the scores, total count, pages, and offset.
 * @throws An error if the global fish caught scores could not be fetched.
 */
export async function getGlobalFishCaughtScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const cacheKey = `topGlobalFishCaughtScores:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalFishCaughtScores = await FishCaught.count({
      distinct: true,
      col: "userId",
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalFishCaughtScores / HIGHSCORE_PAGE_LIMIT);

    const fishCaught = await FishCaught.findAll({
      attributes: [
        "userId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalFishCaught"],
      ],
      group: ["userId"],
      order: [[sequelize.literal("totalFishCaught"), "DESC"]],
      limit: HIGHSCORE_PAGE_LIMIT,
      offset: offset,
      raw: true,
    });

    const mappedScoresPromises = fishCaught.map(async (fishCaught) => {
      const user = await fetchUser(
        messageOrInteraction.client,
        fishCaught.userId
      );
      return {
        exp: fishCaught.totalFishCaught,
        level: getLevelFromExp(fishCaught.totalFishCaught),
        user: user ? user : null,
      };
    });
    const mappedScores = await Promise.all(mappedScoresPromises);
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalFishCaughtScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch {
    throw new Error("Failed to fetch global fish caught.");
  }
}

async function getExpLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  page: number,
  isGlobal: boolean = false
) {
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
}

async function getFishCaughtLeaderboardTable(
  interactionOrMessage: ChatInputCommandInteraction | Message,
  page: number,
  isGlobal: boolean = false
) {
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

function countFishCaught(
  fishCaught: FishCaughtInstance[]
): Record<string, number> {
  return fishCaught.reduce((score, { userId, quantity }) => {
    score[userId] = score[userId] || 0;
    score[userId] += quantity;
    return score;
  }, {});
}
