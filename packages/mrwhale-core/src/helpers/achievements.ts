import { AchievementNames } from "../types/achievement-names";
import { achievements } from "../data/achievements";

/**
 * Get a achievement by name.
 * @param achievementName The name of the achievement.
 */
export function getAchievementByName(achievementName: AchievementNames) {
  return achievements.find(
    (achievement) => achievement.name === achievementName
  );
}

/**
 * Get a achievement by Id.
 * @param achievementId The Id of the achievement.
 */
export function getAchievementById(achievementId: number) {
  return achievements.find((achievement) => achievement.id === achievementId);
}
