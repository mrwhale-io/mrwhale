import { Achievement, Bait, Fish, FishingRod } from "@mrwhale-io/core";

import { CatchResult } from "../types/fishing/catch-result";

export function createCatchResult(
  fishCaught: Fish | null,
  achievements: Achievement[],
  baitUsed: Bait,
  fishingRodUsed: FishingRod
): CatchResult {
  return {
    fishCaught,
    achievements,
    baitUsed,
    fishingRodUsed,
  };
}
