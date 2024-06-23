import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

import {
  Achievement,
  AchievementCriteria,
  Fish,
  achievements,
} from "@mrwhale-io/core";
import {
  UserAchievement,
  UserAchievementInstance,
} from "../models/user-achievement";
import { getTotalFishCaughtByUserInGuild } from "./fish-caught";
import { LevelManager } from "../../client/managers/level-manager";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";

/**
 * Retrieves all achievements for a specific user in a specific guild.
 *
 * This function queries the `UserAchievement` table to find all achievement records
 * associated with the given user ID and guild ID. It returns a promise that resolves
 * to an array of `UserAchievementInstance` objects, which contain details about each
 * achievement the user has earned in the specified guild.
 *
 * @param userId The unique identifier of the user whose achievements are being retrieved.
 * @param guildId The unique identifier of the guild where the user's achievements are being retrieved.
 * @returns A promise that resolves to an array of `UserAchievementInstance` objects representing the user's achievements in the guild.
 */
export async function getUserAchievements(
  userId: string,
  guildId: string
): Promise<UserAchievementInstance[]> {
  return await UserAchievement.findAll({
    where: { userId, guildId },
  });
}

/**
 * Checks and awards fishing achievements to a user based on the fish they have caught.
 *
 * This function retrieves the current achievements of the user, checks if any new achievements
 * are met based on the caught fish, and awards new achievements if the criteria are satisfied.
 *
 * @param interactionOrMessage The interaction or message object from the Discord API, containing details of the user and guild.
 * @param fish The fish that was caught, used to check against achievement criteria.
 * @returns A promise that resolves to an array of new achievements that the user has been awarded.
 */
export async function checkAndAwardFishingAchievements(
  interactionOrMessage:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | Message,
  fish: Fish,
  levelManager: LevelManager
): Promise<Achievement[]> {
  const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
  const userAchievements = await getUserAchievements(userId, guildId);
  const achievedIds = userAchievements.map((ua) => ua.achievementId);
  const newAchievements: Achievement[] = [];

  for (const achievement of achievements) {
    if (achievedIds.includes(achievement.id)) {
      continue;
    }

    const criteria = achievement.criteria;
    const achieved = await hasAchievedFishingAward(
      userId,
      guildId,
      fish,
      criteria
    );

    if (achieved) {
      await createUserAchievement(userId, guildId, achievement);
      newAchievements.push(achievement);
      // Increase exp for the new achievement
      await levelManager.increaseExp(
        interactionOrMessage,
        userId,
        guildId,
        achievement.exp
      );
    }
  }

  return newAchievements;
}

async function hasAchievedFishingAward(
  userId: string,
  guildId: string,
  fish: Fish,
  criteria: AchievementCriteria
): Promise<boolean> {
  switch (criteria.type) {
    case "catch_fish":
      return await hasAchievedCatchFish(userId, guildId, criteria.quantity);

    case "catch_type":
      return fish.name === criteria.fishType;

    case "catch_rarity":
      return fish.rarity === criteria.rarity;

    default:
      return false;
  }
}

async function hasAchievedCatchFish(
  userId: string,
  guildId: string,
  quantity: number
): Promise<boolean> {
  const totalFishCaught = await getTotalFishCaughtByUserInGuild(
    userId,
    guildId
  );
  return totalFishCaught >= quantity;
}

async function createUserAchievement(
  userId: string,
  guildId: string,
  achievement: Achievement
): Promise<void> {
  await UserAchievement.create({
    userId,
    guildId,
    achievementId: achievement.id,
    achievedAt: new Date(),
  });
}
