import { ChatInputCommandInteraction, Message } from "discord.js";
import * as NodeCache from "node-cache";
import * as sequelize from "sequelize";

import { getLevelFromExp } from "@mrwhale-io/core";
import { FishFed, FishFedInstance } from "../models/fish-fed";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { fetchUser } from "./user";
import { MappedScores } from "../../types/scores/mapped-scores";

const leaderboardCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

/**
 * Retrieves the fish fed scores for a specified guild, paginated.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param page The page number to fetch scores for.
 * @returns A Promise that resolves to a ScoreResult containing the scores, total count, pages, and offset.
 * @throws An error if the fish fed scores could not be fetched.
 */
export async function getGuildFishFedScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const guildId = messageOrInteraction.guildId;
    const cacheKey = `topFishFedScores:${guildId}:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalFishFedScores = await FishFed.count({
      where: { guildId },
      distinct: true,
      col: "userId",
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalFishFedScores / HIGHSCORE_PAGE_LIMIT);

    const fishFed = await getGuildScores(guildId, offset);
    const mappedScores = await mapScoresToUsers(messageOrInteraction, fishFed);

    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalFishFedScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch (error) {
    throw new Error("Failed to fetch fish fed scores.");
  }
}

/**
 * Retrieves the global fish fed scores, paginated.
 *
 * This function fetches and calculates the global fish fed scores across all guilds.
 * It supports pagination to navigate through the scores and uses caching to store and
 * retrieve the results efficiently. The function first checks for cached data, and if not
 * found, it queries the database to fetch the total number of users, calculates the total
 * pages, and retrieves the fish fed data for the specified page. It then maps the user
 * IDs to user objects and constructs the final scores result.
 *
 * @param messageOrInteraction The Discord message or interaction instance.
 * @param page The page number to fetch scores for.
 * @returns A Promise that resolves to a ScoreResult containing the scores, total count, pages, and offset.
 * @throws An error if the global fish fed scores could not be fetched.
 */
export async function getGlobalFishFedScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const cacheKey = `topGlobalFishFedScores:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalFishFedScores = await FishFed.count({
      distinct: true,
      col: "userId",
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalFishFedScores / HIGHSCORE_PAGE_LIMIT);

    const fishFed = await getGlobalScores(offset);
    const mappedScores = await mapScoresToUsers(messageOrInteraction, fishFed);

    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalFishFedScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch (error) {
    throw new Error("Failed to fetch global fish fed scores.");
  }
}

/**
 * Retrieves the fish feeding scores for a specific guild, ordered by the total quantity of fish fed in descending order.
 *
 * @param guildId The Id of the guild for which to retrieve the fish feeding scores.
 * @param offset The offset for pagination of the results.
 * @returns A promise that resolves to an array of objects containing user Ids and their corresponding total quantity of fish fed.
 */
async function getGuildScores(
  guildId: string,
  offset: number
): Promise<FishFedInstance[]> {
  return await FishFed.findAll({
    where: { guildId },
    attributes: [
      "userId",
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
    ],
    group: ["userId"],
    order: [[sequelize.literal("totalQuantity"), "DESC"]],
    limit: HIGHSCORE_PAGE_LIMIT,
    offset,
    raw: true,
  });
}

/**
 * Retrieves the global scores for the fish-fed leaderboard.
 *
 * @param offset The offset for pagination.
 * @returns A promise that resolves to an array of FishFedInstance objects containing userId and totalQuantity.
 */
async function getGlobalScores(offset: number): Promise<FishFedInstance[]> {
  return await FishFed.findAll({
    attributes: [
      "userId",
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
    ],
    group: ["userId"],
    order: [[sequelize.literal("totalQuantity"), "DESC"]],
    limit: HIGHSCORE_PAGE_LIMIT,
    offset,
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
  scores: FishFedInstance[]
): Promise<MappedScores[]> {
  const mappedScoresPromises = scores.map(async (score) => {
    const user = await fetchUser(messageOrInteraction.client, score.userId);
    return {
      exp: score.totalQuantity,
      level: getLevelFromExp(score.totalQuantity),
      user: user ? user : null,
    };
  });

  return Promise.all(mappedScoresPromises);
}
