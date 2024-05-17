import {
  FishingRod,
  FishingRodNames,
  getFishingRodById,
  getFishingRodByName,
} from "@mrwhale-io/core";
import { UserInventory } from "../models/user-inventory";
import { updateOrCreateUserItem } from "./user-inventory";

/**
 * Get the fishing rod the user is currently equipped with.
 * @param userId The id of the user to get fishing rod for.
 */
export async function getEquippedFishingRod(
  userId: string
): Promise<FishingRod> {
  const userInventory = await UserInventory.findOne({
    where: { userId: userId, itemType: "FishingRod", equipped: true },
  });

  if (!userInventory) {
    return getFishingRodByName("Basic Fishing Rod");
  }

  return getFishingRodById(userInventory.itemId);
}

/**
 * Adds the fishing rod to the user inventory items.
 * @param userId The id of the user.
 * @param fishingRodName The name of the fishing rod to add.
 */
export async function addFishingRodToUserItems(
  userId: string,
  fishingRodName: FishingRodNames,
  equipped: boolean = true
): Promise<void> {
  const basicFishingRod = getFishingRodByName(fishingRodName);
  await updateOrCreateUserItem(
    userId,
    basicFishingRod.id,
    "FishingRod",
    equipped
  );
}
