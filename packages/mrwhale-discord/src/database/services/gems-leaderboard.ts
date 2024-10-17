import { ChatInputCommandInteraction, Message } from "discord.js";
import * as sequelize from "sequelize";
import * as NodeCache from "node-cache";

import { getLevelFromExp } from "@mrwhale-io/core";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";
import { ScoreResult } from "../../types/scores/score-result";
import { fetchUser } from "./user";
import { UserBalance, UserBalanceInstance } from "../models/user-balance";
import { MappedScores } from "../../types/scores/mapped-scores";

const leaderboardCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

/**
 * Retrieves the global leaderboard scores for gems.
 *
 * @param messageOrInteraction The message or interaction object from Discord.
 * @param page The page number of the leaderboard to retrieve.
 * @returns A promise that resolves to a `ScoreResult` containing the leaderboard scores.
 * @throws Will throw an error if the scores cannot be fetched.
 */
export async function getGlobalGemsScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const cacheKey = `topGlobalGems:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const totalUserBalanceScores = await UserBalance.count({
      distinct: true,
      col: "userId",
    });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(totalUserBalanceScores / HIGHSCORE_PAGE_LIMIT);

    const userBalances = await fetchUserBalances(offset);

    const mappedScores = await mapScoresToUsers(
      messageOrInteraction,
      userBalances
    );
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: totalUserBalanceScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch {
    throw new Error("Failed to fetch global gems scores.");
  }
}

/**
 * Retrieves the guild leaderboard scores for gems.
 *
 * @param messageOrInteraction The message or interaction object from Discord.
 * @param page The page number of the leaderboard to retrieve.
 * @returns A promise that resolves to a `ScoreResult` containing the leaderboard scores.
 * @throws Will throw an error if the scores cannot be fetched.
 */
export async function getGuildGemsScores(
  messageOrInteraction: Message | ChatInputCommandInteraction,
  page: number
): Promise<ScoreResult> {
  try {
    const guildId = messageOrInteraction.guildId;
    const cacheKey = `topGemsScores:${guildId}:${page}`;
    const cachedData = leaderboardCache.get<ScoreResult>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const userBalanceScores = await UserBalance.count({ where: { guildId } });
    const offset = (page - 1) * HIGHSCORE_PAGE_LIMIT;
    const totalPages = Math.ceil(userBalanceScores / HIGHSCORE_PAGE_LIMIT);

    const userBalances = await getGuildUserBalances(guildId, offset);

    const mappedScores = await mapScoresToUsers(
      messageOrInteraction,
      userBalances
    );
    const topScorePage: ScoreResult = {
      scores: mappedScores,
      total: userBalanceScores,
      pages: totalPages,
      offset,
    };

    leaderboardCache.set(cacheKey, topScorePage);

    return topScorePage;
  } catch {
    throw new Error("Failed to fetch guild gems scores.");
  }
}

/**
 * Fetches user balances from the database, ordered by total balance in descending order.
 *
 * @param offset The offset for pagination.
 * @returns A promise that resolves to an array of user balance instances.
 */
async function fetchUserBalances(
  offset: number
): Promise<UserBalanceInstance[]> {
  return await UserBalance.findAll({
    attributes: [
      "userId",
      [sequelize.fn("SUM", sequelize.col("balance")), "totalBalance"],
    ],
    group: ["userId"],
    order: [[sequelize.literal("totalBalance"), "DESC"]],
    limit: HIGHSCORE_PAGE_LIMIT,
    offset: offset,
    raw: true,
  });
}

/**
 * Retrieves the balances of users in a specific guild, ordered by their total balance in descending order.
 *
 * @param guildId The ID of the guild to retrieve user balances for.
 * @param offset The offset for pagination.
 * @returns A promise that resolves to an array of user balance instances.
 */
async function getGuildUserBalances(
  guildId: string,
  offset: number
): Promise<UserBalanceInstance[]> {
  return await UserBalance.findAll({
    where: { guildId },
    attributes: [
      "userId",
      [sequelize.fn("SUM", sequelize.col("balance")), "totalBalance"],
    ],
    group: ["userId"],
    order: [[sequelize.literal("totalBalance"), "DESC"]],
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
  scores: UserBalanceInstance[]
): Promise<MappedScores[]> {
  const mappedScoresPromises = scores.map(async (score) => {
    const user = await fetchUser(messageOrInteraction.client, score.userId);
    return {
      exp: score.totalBalance,
      level: getLevelFromExp(score.totalBalance),
      user: user ? user : null,
    };
  });

  return Promise.all(mappedScoresPromises);
}
