// General Fish Types
export type GeneralFishTypeNames =
  | "Krill"
  | "Shrimp"
  | "Crab"
  | "Lobster"
  | "Cod"
  | "Cuttlefish"
  | "Rockfish"
  | "Octopus"
  | "Shark"
  | "Giant Squid"
  | "Colossal Squid";

// Seasonal Fish Types
export type SpringFishTypeNames =
  | "Spring Trout"
  | "Spring Bass"
  | "Spring Salmon"
  | "Spring Catfish";

export type SummerFishTypeNames =
  | "Summer Salmon"
  | "Summer Bass"
  | "Summer Pike"
  | "Sunfish";

export type AutumnFishTypeNames =
  | "Fall Bass"
  | "Autumn Carp"
  | "Fall Trout"
  | "Pumpkinseed";

export type WinterFishTypeNames =
  | "Winter Trout"
  | "Winter Pike"
  | "Winter Flounder"
  | "Ice Fish";

export type NocturnalFishTypeNames =
  | "Nocturnal Trout"
  | "Nocturnal Bass"
  | "Nighttime Catfish";

// Combined Fish Type Names
export type FishTypeNames =
  | GeneralFishTypeNames
  | SpringFishTypeNames
  | SummerFishTypeNames
  | AutumnFishTypeNames
  | WinterFishTypeNames
  | NocturnalFishTypeNames;
