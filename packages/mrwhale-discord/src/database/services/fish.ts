import { Fish, FishTypeNames, getFishByName } from "@mrwhale-io/core";
import { getUserItemById } from "./user-inventory";

/**
 * Fetch a fish from the given user's inventory by name.
 * @param userId The id of the user the fish belongs to.
 * @param fishName The of the fish.
 */
export async function getUserFishByName(
  userId: string,
  fishName: FishTypeNames
): Promise<Fish> {
  const fish = getFishByName(fishName);
  const inventoryItem = await getUserItemById(userId, fish.id, "Fish");

  if (inventoryItem) {
    return fish;
  }

  return null;
}
