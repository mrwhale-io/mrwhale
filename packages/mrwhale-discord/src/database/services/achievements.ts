import { Achievement, Fish, achievements } from "@mrwhale-io/core";
import {
  UserAchievement,
  UserAchievementInstance,
} from "../models/user-achievement";
import { getFishCaughtByUserInGuild } from "./fish-caught";

export async function getUserAchievements(
  userId: string,
  guildId: string
): Promise<UserAchievementInstance[]> {
  return await UserAchievement.findAll({
    where: { userId, guildId },
  });
}

export async function checkAndAwardAchievements(
  userId: string,
  guildId: string,
  fish: Fish
): Promise<Achievement[]> {
  const userAchievements = await getUserAchievements(userId, guildId);
  const achievedIds = userAchievements.map((ua) => ua.achievementId);
  const newAchievements: Achievement[] = [];

  for (const achievement of achievements) {
    if (achievedIds.includes(achievement.id)) {
      continue;
    }

    const criteria = achievement.criteria;
    let achieved = false;

    switch (criteria.type) {
      case "catch_fish":
        const fishCaught = await getFishCaughtByUserInGuild(
          userId,
          guildId,
          fish.id,
          fish.rarity
        );
        if (fishCaught.quantity >= criteria.quantity) {
          achieved = true;
        }
        break;
      case "catch_type":
        if (fish.name === criteria.fishType) {
          achieved = true;
        }
        break;
      case "catch_rarity":
        if (fish.rarity === criteria.rarity) {
          achieved = true;
        }
        break;
    }

    if (achieved) {
      await UserAchievement.create({
        userId,
        guildId,
        achievementId: achievement.id,
        achievedAt: new Date(),
      });
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}
