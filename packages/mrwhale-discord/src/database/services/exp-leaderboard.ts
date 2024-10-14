import { ChatInputCommandInteraction, Message } from "discord.js";
import * as sequelize from "sequelize";
import * as NodeCache from "node-cache";

import { getLevelFromExp } from "@mrwhale-io/core";
import { Score, ScoreInstance } from "../models/score";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { fetchUser } from "./user";
import { MappedScores } from "../../types/scores/mapped-scores";

const leaderboardCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

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

    // Check if the leaderboard data is cached
    if (cachedData) {
      return cachedData;
    }

    // Fetch the total number of player scores in the guild
    const totalPlayerScores = await Score.count({ where: { guildId } });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalPlayerScores / HIGHSCORE_PAGE_LIMIT);

    // Fetch the scores for the specified page
    const scores = await getGuildScores(guildId, offset);

    const mappedScores = await mapScoresToUsers(messageOrInteraction, scores);
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
 * pages, and retrieves score data for the specified page. It then maps the user
 * IDs to user objects and constructs the final scores result.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param page The page number to fetch scores for.
 * @returns A Promise that resolves to a ScoreResult containing the scores, total count, pages, and offset.
 * @throws An error if the global scores could not be fetched.
 */
export async function getGlobalExpScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const cacheKey = `topGlobalExpScores:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    // Check if the leaderboard data is cached
    if (cachedData) {
      return cachedData;
    }

    // Fetch the total number of player scores
    const totalPlayerScores = await Score.count({
      distinct: true,
      col: "userId",
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalPlayerScores / HIGHSCORE_PAGE_LIMIT);

    // Fetch the scores for the specified page
    const scores = await getTopScores(offset);

    const mappedScores = await mapScoresToUsers(messageOrInteraction, scores);
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
 * Retrieves the guild scores from the database.
 *
 * @param guildId The guild ID to fetch scores for.
 * @param offset The number of records to skip before starting to collect the result set.
 * @returns A promise that resolves to an array of ScoreInstance objects containing userId and experience points.
 */
async function getGuildScores(
  guildId: string,
  offset: number
): Promise<ScoreInstance[]> {
  return await Score.findAll({
    where: {
      guildId,
    },
    order: [["exp", "DESC"]],
    limit: HIGHSCORE_PAGE_LIMIT,
    offset: offset,
    raw: true,
  });
}

/**
 * Retrieves the top scores from the database with pagination support.
 *
 * @param offset The number of records to skip before starting to collect the result set.
 * @returns A promise that resolves to an array of ScoreInstance objects containing userId and total experience points.
 */
async function getTopScores(offset: number): Promise<ScoreInstance[]> {
  return await Score.findAll({
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
}

/**
 * Maps scores to user objects.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param scores The scores to map.
 * @returns A Promise that resolves to an array of mapped scores.
 */
async function mapScoresToUsers(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  scores: ScoreInstance[]
): Promise<MappedScores[]> {
  const mappedScoresPromises = scores.map(async (score) => {
    const user = await fetchUser(messageOrInteraction.client, score.userId);
    return {
      exp: score.exp || score.total,
      level: getLevelFromExp(score.exp || score.total),
      user: user ? user : null,
    };
  });

  return Promise.all(mappedScoresPromises);
}
