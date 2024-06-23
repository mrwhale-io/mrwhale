import { AchievementNames } from "../types/achievement-names";
import { achievements } from "../data/achievements";
import { Achievement } from "../types/achievement";

/**
 * Get a achievement by name.
 * @param achievementName The name of the achievement.
 */
export function getAchievementByName(
  achievementName: AchievementNames
): Achievement {
  return achievements.find(
    (achievement) => achievement.name === achievementName
  );
}

/**
 * Get a achievement by Id.
 * @param achievementId The Id of the achievement.
 */
export function getAchievementById(achievementId: number): Achievement {
  return achievements.find((achievement) => achievement.id === achievementId);
}
