import { Achievement, Bait, Fish, FishingRod } from "@mrwhale-io/core";

export interface CatchResult {
  fishCaught: Fish;
  achievements: Achievement[];
  fishingRodUsed: FishingRod;
  baitUsed: Bait;
}
