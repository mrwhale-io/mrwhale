import { ChatInputCommandInteraction, Message } from "discord.js";
import * as sequelize from "sequelize";
import * as NodeCache from "node-cache";

import { getLevelFromExp } from "@mrwhale-io/core";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { FishCaught, FishCaughtInstance } from "../models/fish-caught";
import { fetchUser } from "./user";
import { MappedScores } from "../../types/scores/mapped-scores";

const leaderboardCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

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
  try {
    const guildId = messageOrInteraction.guildId;
    const cacheKey = `topFishCaughtScores:${guildId}:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalFishCaughtScores = await FishCaught.count({
      where: { guildId },
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalFishCaughtScores / HIGHSCORE_PAGE_LIMIT);

    const fishCaught = await getGuildFishCaught(guildId, offset);

    const mappedScores = await mapScoresToUsers(
      messageOrInteraction,
      fishCaught
    );
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalFishCaughtScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
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

    const fishCaught = await getFishCaught(offset);

    const mappedScores = await mapScoresToUsers(
      messageOrInteraction,
      fishCaught
    );
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

/**
 * Retrieves the leaderboard of fish caught for a specific guild.
 *
 * @param guildId The ID of the guild.
 * @param offset The offset for pagination.
 * @returns A promise that resolves to an array of FishCaughtInstance objects.
 */
async function getGuildFishCaught(
  guildId: string,
  offset: number
): Promise<FishCaughtInstance[]> {
  return await FishCaught.findAll({
    where: { guildId },
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
}

/**
 * Retrieves a leaderboard of users based on the total number of fish caught.
 *
 * @param offset The offset for pagination of the leaderboard.
 * @returns A promise that resolves to an array of FishCaughtInstance objects, each containing the userId and totalFishCaught.
 */
async function getFishCaught(offset: number): Promise<FishCaughtInstance[]> {
  return await FishCaught.findAll({
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
  scores: FishCaughtInstance[]
): Promise<MappedScores[]> {
  const mappedScoresPromises = scores.map(async (score) => {
    const user = await fetchUser(messageOrInteraction.client, score.userId);
    return {
      exp: score.totalFishCaught,
      level: getLevelFromExp(score.totalFishCaught),
      user: user ? user : null,
    };
  });

  return Promise.all(mappedScoresPromises);
}
