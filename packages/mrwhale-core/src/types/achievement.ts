import { AchievementCriteria } from "./achievement-criteria";
import { AchievementNames } from "./achievement-names";

export interface Achievement {
  /**
   * Unique identifier for the achievement.
   */
  id: number;

  /**
   * Name of the achievement.
   */
  name: AchievementNames;

  /**
   * Description of the achievement.
   */
  description: string;

  /**
   * The icon representing this achievement.
   */
  icon: string;

  /**
   * Criteria that must be met to achieve this achievement.
   */
  criteria: AchievementCriteria;

  /**
   * The amount of experience points (EXP) awarded upon achieving this achievement.
   */
  exp: number;
}
