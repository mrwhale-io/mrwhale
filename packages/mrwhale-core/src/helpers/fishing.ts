import { Fish } from "../types/fish";
import { fishTypes } from "../data/fish-types";
import { FishTypeNames } from "../types/fish-type-names";
import { FishingRod } from "../types/fishing-rod";
import { weightedSample } from "../util/weighted-sample";
import { fishingRods } from "../data/fishing-rods";
import { FishingRodNames } from "../types/fishing-rod-names";

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
 * Get a fish type by name.
 * @param fishId The id of the fish.
 */
export function getFishById(fishId: number) {
  return fishTypes.find((fishType) => fishType.id === fishId);
}

/**
 * Get a fishing rod by name.
 * @param fishingRodName The name of the fishing rod.
 */
export function getFishingRodByName(fishingRodName: FishingRodNames) {
  return fishingRods.find((fishingRod) => fishingRod.name === fishingRodName);
}

/**
 * Get a fishing rod by id.
 * @param fishingRodId The id of the fishing rod.
 */
export function getFishingRodById(fishingRodId: number) {
  return fishingRods.find((fishingRod) => fishingRod.id === fishingRodId);
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
 * Returns a random fish from a given collection of fish, taking into account the fishing rod's effect.
 * @param catchableFish An array of all the available fish to catch.
 * @param fishingRod The fishing rod being used by the player.
 */
export function catchFish(catchableFish: Fish[], fishingRod: FishingRod): Fish {
  let fishCaught = weightedSample(
    catchableFish,
    fishingRod.probabilityMultiplier
  );
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
