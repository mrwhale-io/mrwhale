import { Fish } from "../types/fish";
import { fishTypes } from "../data/fish-types";
import { weightedSample } from "../util/weighted-sample";
import { FishTypeNames } from "../types/fish-type-names";

export interface FishSpawnedResult {
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
 * Spawn fish of random types.
 * @param count The number of fish to return.
 */
export function spawnFish(
  count: number = 1
): Record<string, FishSpawnedResult> {
  const totalfishSpawned: Fish[] = [];
  for (let i = 0; i < count; i++) {
    const fishSpawned = weightedSample(fishTypes);
    totalfishSpawned.push(fishSpawned);
  }

  return countFishSpawned(totalfishSpawned);
}

/**
 * Returns a random fish from a given collection of fish.
 * @param catchableFish An array of all the available fish to catch.
 */
export function catchFish(catchableFish: Fish[]): Fish {
  let fishCaught = weightedSample(catchableFish);
  const random = Math.random();

  if (random > 0.5) {
    return null;
  }

  return fishCaught;
}

/**
 * Helper function to count the types of fish spawned.
 * @param fishSpawned The fish to count.
 */
function countFishSpawned(
  fishSpawned: Fish[]
): Record<string, FishSpawnedResult> {
  return fishSpawned.reduce((fish, { name, worth, icon }) => {
    fish[name] = fish[name] || { icon, worth, quantity: 0 };
    fish[name].quantity++;
    return fish;
  }, {});
}
