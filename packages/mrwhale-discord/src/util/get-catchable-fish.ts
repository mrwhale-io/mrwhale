import {
  Fish,
  FishSpawnedResult,
  FishTypeNames,
  getFishByName,
} from "@mrwhale-io/core";

/**
 * Gets all the catchable fish from the guild fish object.
 * @param allGuildFish The object containing all the guild fish.
 * @returns An array of fish that can be caught.
 */
export function getCatchableFish(
  allGuildFish: Record<string, FishSpawnedResult>
): Fish[] {
  return Object.entries(allGuildFish).flatMap(([key, value]) => {
    const fish = getFishByName(key as FishTypeNames);
    return Array(value.quantity).fill(fish);
  });
}
