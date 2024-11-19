import { Fish } from "../types/fish";
import {
  baseFishTypes,
  allFishTypes,
  springFishTypes,
  summerFishTypes,
  fallFishTypes,
  winterFishTypes,
  nocturnalFishTypes,
} from "../data/fish-types";
import { FishTypeNames } from "../types/fish-type-names";
import { FishingRod } from "../types/fishing-rod";
import { weightedSample } from "../util/weighted-sample";
import { fishingRods } from "../data/fishing-rods";
import { FishingRodNames } from "../types/fishing-rod-names";
import { Bait } from "../types/bait";
import { baits } from "../data/baits";
import { FishRarity } from "../types/fish-rarity";
import { getSeason } from "../util/weather-helpers";

export interface FishSpawnedResult {
  icon: string;
  worth: number;
  quantity: number;
  rarity: FishRarity;
}

/**
 * Get a fish type by name.
 * @param fishName The name of the fish.
 */
export function getFishByName(fishName: FishTypeNames): Fish {
  return allFishTypes.find((fishType) => fishType.name === fishName);
}

/**
 * Get a fish type by name.
 * @param fishId The id of the fish.
 */
export function getFishById(fishId: number): Fish {
  return allFishTypes.find((fishType) => fishType.id === fishId);
}

/**
 * Get a fishing rod by name.
 * @param fishingRodName The name of the fishing rod.
 */
export function getFishingRodByName(
  fishingRodName: FishingRodNames
): FishingRod {
  return fishingRods.find((fishingRod) => fishingRod.name === fishingRodName);
}

/**
 * Get a fishing rod by id.
 * @param fishingRodId The id of the fishing rod.
 */
export function getFishingRodById(fishingRodId: number): FishingRod {
  return fishingRods.find((fishingRod) => fishingRod.id === fishingRodId);
}

/**
 * Get a fishing bait by name.
 * @param baitName The name of the bait.
 */
export function getBaitByName(baitName: string): Bait {
  return baits.find((bait) => bait.name === baitName);
}

/**
 * Get a fishing bait by id.
 * @param baitId The id of the bait.
 */
export function getBaitById(baitId: number): Bait {
  return baits.find((bait) => bait.id === baitId);
}

/**
 * Spawn fish of random types.
 * @param count The number of fish to return.
 * @param maxRarityLevel Only spawn fish below this rarity level.
 */
export function spawnFish(
  count: number = 1,
  maxRarityLevel: number
): Record<string, FishSpawnedResult> {
  const totalfishSpawned: Fish[] = [];
  const fishTypes = getFishTypes();
  const catchableFish = fishTypes.filter(
    (fishType) => fishType.rarityLevel <= maxRarityLevel
  );

  for (let i = 0; i < count; i++) {
    const fishSpawned = weightedSample(catchableFish);
    totalfishSpawned.push(fishSpawned);
  }

  return countFishSpawned(totalfishSpawned);
}

/**
 * Returns a random fish from a given collection of fish, taking into account the fishing rod's and bait's effects.
 * @param fishTypes An array of all the available fish to catch.
 * @param fishingRod The fishing rod being used by the player.
 * @param bait The bait being used by the player.
 * @param baseNoCatchProbability The probability that nothing will be caught.
 */
export function catchFish(
  fishTypes: Fish[],
  fishingRod: FishingRod,
  bait: Bait,
  baseNoCatchProbability: number
): Fish | null {
  // Filter fish based on the rod's maxCatchableRarity
  const catchableFish = fishTypes.filter(
    (fish) => fish.rarityLevel <= fishingRod.maxCatchableRarity
  );

  // Adjust the noCatchProbability based on the fishing rod's multiplier and bait's effectiveness
  const adjustedNoCatchProbability =
    baseNoCatchProbability /
    (fishingRod.probabilityMultiplier * bait.effectiveness);

  // Calculate the total weight including the adjusted noCatchProbability
  const totalWeight = catchableFish.reduce((sum, fish) => {
    // Calculate adjusted probability giving more weight to rarer fish
    const adjustedProbability =
      fish.probability *
      fishingRod.probabilityMultiplier *
      Math.pow(bait.effectiveness, fish.rarityLevel);
    return sum + adjustedProbability;
  }, adjustedNoCatchProbability);

  // Generate a random number within the total weight
  const rnd = Math.random() * totalWeight;
  let accumulator = 0;

  // Iterate over the catchable fish types to determine which fish is chosen
  for (const fish of catchableFish) {
    // Calculate adjusted probability giving more weight to rarer fish
    const adjustedProbability =
      fish.probability *
      fishingRod.probabilityMultiplier *
      Math.pow(bait.effectiveness, fish.rarityLevel);
    accumulator += adjustedProbability;
    if (rnd < accumulator) {
      return fish;
    }
  }

  // Check if the random number falls within the range of adjustedNoCatchProbability
  if (rnd < accumulator + adjustedNoCatchProbability) {
    return null;
  }

  // In case of an edge case, return null
  return null;
}

/**
 * Helper function to count the types of fish spawned.
 * @param fishSpawned The fish to count.
 */
export function countFishSpawned(
  fishSpawned: Fish[]
): Record<string, FishSpawnedResult> {
  return fishSpawned.reduce((fish, { name, worth, icon, rarity }) => {
    fish[name] = fish[name] || { icon, worth, rarity, quantity: 0 };
    fish[name].quantity++;
    return fish;
  }, {});
}

/**
 * Counts the number of fish by their rarity from the given collection of spawned fish.
 *
 * This function takes a record of fish, where each key represents a unique fish identifier,
 * and the value is an object containing the rarity and quantity of that fish. It returns an
 * object that maps each fish rarity to the total quantity of fish of that rarity.
 *
 * @param fish A record of spawned fish where the key is the fish identifier and the value contains rarity and quantity.
 * @returns An object mapping each fish rarity to the total quantity of fish of that rarity.
 */
export function countFishByRarity(
  fish: Record<string, FishSpawnedResult>
): { [key in FishRarity]: number } {
  const rarityCounts: { [key in FishRarity]: number } = {
    Common: 0,
    Uncommon: 0,
    Rare: 0,
    Epic: 0,
    Legendary: 0,
  };

  Object.values(fish).forEach(({ rarity, quantity }) => {
    if (rarityCounts[rarity] !== undefined) {
      rarityCounts[rarity] += quantity;
    }
  });

  return rarityCounts;
}

/**
 * Retrieves the types of fish available based on the current time of day and season.
 *
 * This function adjusts the base fish types by adding nocturnal fish types if it is nighttime,
 * and by adding seasonal fish types based on the current season.
 *
 * @returns A promise that resolves to an array of available fish types.
 */
function getFishTypes(): Fish[] {
  const timeOfDay = new Date().getHours();
  const season = getSeason();
  let fishTypes: Fish[] = [...baseFishTypes];

  // Adjust fish types based on time of day
  if (timeOfDay >= 18 || timeOfDay < 6) {
    // Nighttime fish
    fishTypes = [...fishTypes, ...nocturnalFishTypes];
  }

  // Adjust fish types based on season
  if (season === "Winter") {
    fishTypes = [...fishTypes, ...winterFishTypes];
  } else if (season === "Spring") {
    fishTypes = [...fishTypes, ...springFishTypes];
  } else if (season === "Summer") {
    fishTypes = [...fishTypes, ...summerFishTypes];
  } else {
    fishTypes = [...fishTypes, ...fallFishTypes];
  }

  return fishTypes;
}
