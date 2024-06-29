import { Bait, getBaitById } from "@mrwhale-io/core";
import { UserInventory } from "../models/user-inventory";
import {
  getUserItemById,
  getUserItemsByType,
  useUserItem,
} from "./user-inventory";

/**
 * Get the bait the user is currently equipped with.
 * @param userId The id of the user.
 * @param guildId The id of the guild.
 */
export async function getEquippedBait(
  userId: string,
  guildId: string
): Promise<Bait> {
  const userInventory = await UserInventory.findOne({
    where: { userId, guildId, itemType: "Bait", equipped: true },
  });

  if (!userInventory) {
    return {
      id: 0,
      name: "No Bait",
      description: "No bait used.",
      icon: "",
      cost: 0,
      effectiveness: 1,
      minLevel: 0,
    };
  }

  return getBaitById(userInventory.itemId);
}

/**
 * Retrieves all baits owned by a specific player in a specific guild.
 *
 * This function queries the UserInventory table to find all bait items that are owned by
 * the specified user Id within the specified guild. It then maps these inventory entries to
 * their corresponding bait details by fetching the bait information using the
 * item Ids.
 *
 * @param userId The Id of the user for whom the baits are to be retrieved.
 * @param guildId The Id of the guild in which the user's inventory is being queried.
 * @returns A promise that resolves to an array of Bait objects owned by the user in the specified guild.
 */
export async function getBaitOwnedByPlayer(
  userId: string,
  guildId: string
): Promise<Bait[]> {
  const baits = await getUserItemsByType(userId, guildId, "Bait");

  return baits.map((bait) => getBaitById(bait.itemId));
}

/**
 * Consumes the specified bait item from the user's inventory.
 * Decreases the quantity of the bait item by 1.
 *
 * @param userId The Id of the user.
 * @param guildId The Id of the guild.
 * @param baitId The Id of the bait item to be consumed.
 */
export async function consumeBait(
  userId: string,
  guildId: string,
  baitId: number
): Promise<void> {
  const baitUserItem = await getUserItemById(userId, guildId, baitId, "Bait");

  if (baitUserItem) {
    await useUserItem(userId, guildId, baitUserItem, 1);
  }
}
