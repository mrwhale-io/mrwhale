import { AchievementCriteriaTypes } from "./achievement-criteria-types";
import { FishRarity } from "./fish-rarity";
import { FishTypeNames } from "./fish-type-names";

export interface AchievementCriteria {
  type: AchievementCriteriaTypes;
  quantity?: number;
  fishType?: FishTypeNames;
  rarity?: FishRarity;
}
