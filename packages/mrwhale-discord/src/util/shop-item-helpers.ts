import {
  Bait,
  FishingRod,
  ItemTypes,
  baits,
  fishingRods,
} from "@mrwhale-io/core";

/**
 * Gets shop items by type.
 * @param itemType The item type.
 */
export function getShopItemsByType<T extends ItemTypes>(
  itemType: T
): T extends "FishingRod" ? FishingRod[] : T extends "Bait" ? Bait[] : never {
  const items = {
    FishingRod: fishingRods,
    Bait: baits,
  };

  if (itemType in items) {
    return items[itemType as keyof typeof items] as any;
  }

  throw new Error(`Invalid item type: ${itemType}`);
}

/**
 * Gets the available fishing rods based on the user's level and the next unlockable fishing rod.
 * @param userLevel The user's current level.
 */
export async function getFishingRodsAvailable(userLevel: number) {
  const allFishingRods = getShopItemsByType("FishingRod").filter(
    (fishingRod) => fishingRod.name !== "Basic Fishing Rod"
  );

  // Filter available fishing rods based on user's level
  const availableFishingRods = allFishingRods.filter(
    (fishingRod) => fishingRod.minLevel <= userLevel
  );
  // Find the next unlockable fishing rod
  const nextUnlockableFishingRod = allFishingRods.find(
    (fishingRod) => fishingRod.minLevel > userLevel
  );

  return { availableFishingRods, nextUnlockableFishingRod };
}

/**
 * Gets the available bait based on the user's level and the next unlockable bait.
 * @param userLevel The user's current level.
 */
export async function getBaitsAvailable(userLevel: number) {
  const allBaitsAvailable = getShopItemsByType("Bait");

  // Filter available baits based on user's level
  const availableBaits = allBaitsAvailable.filter(
    (bait) => bait.minLevel <= userLevel
  );
  // Find the next unlockable bait
  const nextUnlockableBait = allBaitsAvailable.find(
    (bait) => bait.minLevel > userLevel
  );

  return { availableBaits, nextUnlockableBait };
}
