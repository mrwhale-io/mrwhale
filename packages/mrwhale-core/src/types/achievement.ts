import { AchievementCriteria } from "./achievement-criteria";
import { AchievementNames } from "./achievement-names";

export interface Achievement {
  id: number;
  name: AchievementNames;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
}
