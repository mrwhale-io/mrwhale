import { ChatInputCommandInteraction, Message } from "discord.js";
import * as sequelize from "sequelize";
import * as NodeCache from "node-cache";

import { getLevelFromExp } from "@mrwhale-io/core";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { fetchUser } from "./user";
import { ChestsOpened, ChestsOpenedInstance } from "../models/chests-opened";
import { MappedScores } from "../../types/scores/mapped-scores";

const leaderboardCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

/**
 * Retrieves the global leaderboard scores for chests opened.
 *
 * @param messageOrInteraction The message or interaction object from Discord.
 * @param page The page number of the leaderboard to retrieve.
 * @returns A promise that resolves to a `ScoreResult` containing the leaderboard scores.
 * @throws Will throw an error if the scores cannot be fetched.
 */
export async function getGlobalChestsOpenedScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const cacheKey = `topGlobalChestsOpenedScores:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    // Check if the leaderboard data is cached
    if (cachedData) {
      return cachedData;
    }

    // Fetch the total number of chests opened in the guild
    const totalChestsOpenedScores = await ChestsOpened.count({
      distinct: true,
      col: "userId",
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(
      totalChestsOpenedScores / HIGHSCORE_PAGE_LIMIT
    );

    // Fetch the chests opened for the specified page
    const chestsOpened = await getChestsOpened(offset);

    const mappedScores = await mapScoresToUsers(
      messageOrInteraction,
      chestsOpened
    );
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalChestsOpenedScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch {
    throw new Error("Failed to fetch global chests opened.");
  }
}

/**
 * Retrieves the leaderboard scores for chests opened in a guild.
 *
 * @param messageOrInteraction The message or interaction object containing the guild ID.
 * @param page The page number for pagination.
 * @returns A promise that resolves to a `ScoreResult` object containing the leaderboard scores.
 * @throws An error if the scores cannot be fetched.
 */
export async function getGuildChestsOpenedScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const guildId = messageOrInteraction.guildId;
    const cacheKey = `topChestsOpenedScores:${guildId}:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalChestsOpenedScores = await ChestsOpened.count({
      where: { guildId },
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(
      totalChestsOpenedScores / HIGHSCORE_PAGE_LIMIT
    );

    const chestsOpened = await getGuildChestsOpened(guildId, offset);

    const mappedScores = await mapScoresToUsers(
      messageOrInteraction,
      chestsOpened
    );
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalChestsOpenedScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch {
    throw new Error("Failed to fetch guild chests opened.");
  }
}

/**
 * Retrieves a list of users and their total number of chests opened, ordered by the highest number of chests opened.
 *
 * @param offset The number of records to skip before starting to collect the result set.
 * @returns A promise that resolves to an array of objects containing userId and totalChestsOpened.
 */
async function getChestsOpened(
  offset: number
): Promise<ChestsOpenedInstance[]> {
  return await ChestsOpened.findAll({
    attributes: [
      "userId",
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalChestsOpened"],
    ],
    group: ["userId"],
    order: [[sequelize.literal("totalChestsOpened"), "DESC"]],
    limit: HIGHSCORE_PAGE_LIMIT,
    offset: offset,
    raw: true,
  });
}

/**
 * Retrieves the leaderboard of chests opened for a specific guild.
 *
 * @param guildId The ID of the guild.
 * @param offset The offset for pagination.
 * @returns A promise that resolves to an array of ChestsOpenedInstance objects, each containing the userId and totalChestsOpened.
 */
async function getGuildChestsOpened(
  guildId: string,
  offset: number
): Promise<ChestsOpenedInstance[]> {
  return await ChestsOpened.findAll({
    where: { guildId },
    attributes: [
      "userId",
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalChestsOpened"],
    ],
    group: ["userId"],
    order: [[sequelize.literal("totalChestsOpened"), "DESC"]],
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
  scores: ChestsOpenedInstance[]
): Promise<MappedScores[]> {
  const mappedScoresPromises = scores.map(async (score) => {
    const user = await fetchUser(messageOrInteraction.client, score.userId);
    return {
      exp: score.totalChestsOpened,
      level: getLevelFromExp(score.totalChestsOpened),
      user: user ? user : null,
    };
  });

  return Promise.all(mappedScoresPromises);
}
