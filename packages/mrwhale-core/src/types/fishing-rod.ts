import { FishingRodNames } from "./fishing-rod-names";

export interface FishingRod {
  id: number;
  name: FishingRodNames;
  description: string;
  probabilityMultiplier: number;
  cost: number;
}
