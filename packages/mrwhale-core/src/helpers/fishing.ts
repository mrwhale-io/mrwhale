import { Fish } from "../types/fish";
import { fishTypes } from "../data/fish-types";
import { weightedSample } from "../util/weighted-sample";
import { FishTypeNames } from "../types/fish-type-names";

export interface FishCaughtResult {
  icon: string;
  worth: number;
  quantity: number;
}

/**
 * Get a fish type by name.
 * @param fishName The name of the fish.
 */
export function getFishByName(fishName: FishTypeNames) {
  return fishTypes.find((fishType) => fishType.name === fishName);
}

/**
 * Catch fish of random types.
 * @param numberOfCasts The number of fish to return.
 */
export function catchFish(
  numberOfCasts: number = 1
): Record<string, FishCaughtResult> {
  const totalFishCaught: Fish[] = [];
  for (let i = 0; i < numberOfCasts; i++) {
    const fishCaught = weightedSample(fishTypes);
    totalFishCaught.push(fishCaught);
  }

  return countFishCaught(totalFishCaught);
}

/**
 * Helper function to count the types of fish caught.
 * @param fishCaught The fish to count.
 */
function countFishCaught(fishCaught: Fish[]): Record<string, FishCaughtResult> {
  return fishCaught.reduce((fish, { name, worth, icon }) => {
    fish[name] = fish[name] || { icon, worth, quantity: 0 };
    fish[name].quantity++;
    return fish;
  }, {});
}
