import {
  FishingRod,
  FishingRodNames,
  getFishingRodById,
  getFishingRodByName,
} from "@mrwhale-io/core";
import { UserInventory, UserInventoryInstance } from "../models/user-inventory";
import { getUserItemsByType, updateOrCreateUserItem } from "./user-inventory";

/**
 * Retrieves the fishing rod that the user is currently equipped with.
 *
 * This function queries the UserInventory table to find the fishing rod that is currently equipped by
 * the specified user. If the user does not have any fishing rod equipped, the function returns the
 * basic fishing rod.
 *
 * @param userId The Id of the user to get the equipped fishing rod for.
 * @param guildId The of the guild.
 */
export async function getEquippedFishingRod(
  userId: string,
  guildId: string
): Promise<FishingRod> {
  const userInventory = await UserInventory.findOne({
    where: {
      userId: userId,
      guildId: guildId,
      itemType: "FishingRod",
      equipped: true,
    },
  });

  if (!userInventory) {
    return getFishingRodByName("Basic Fishing Rod");
  }

  return getFishingRodById(userInventory.itemId);
}

/**
 * Retrieves the unique Ids of all fishing rods owned by a group of players.
 *
 * This function queries the UserInventory table to find all unique fishing rod IDs that are owned by
 * the specified user IDs. The result is a list of fishing rod item IDs without duplicates.
 *
 * @param userIds An array of user Ids for which the fishing rod Ids are to be retrieved.
 */
export async function getUniqueFishingRodIds(
  userIds: string[]
): Promise<number[]> {
  const fishingRods = await UserInventory.findAll({
    attributes: ["itemId"],
    where: {
      itemType: "FishingRod",
      userId: userIds,
    },
    group: ["itemId"],
  });

  return fishingRods.map((fishingRod) => fishingRod.itemId);
}

/**
 * Retrieves all fishing rods owned by a specific player in a specific guild.
 *
 * This function queries the UserInventory table to find all fishing rod items that are owned by
 * the specified user Id within the specified guild. It then maps these inventory entries to
 * their corresponding fishing rod details by fetching the fishing rod information using the
 * item IDs.
 *
 * @param userId The Id of the user for whom the fishing rods are to be retrieved.
 * @param guildId The Id of the guild in which the user's inventory is being queried.
 * @returns A promise that resolves to an array of FishingRod objects owned by the user in the specified guild.
 */
export async function getFishingRodsOwnedByPlayer(
  userId: string,
  guildId: string
): Promise<FishingRod[]> {
  const fishingRods = await getUserItemsByType(userId, guildId, "FishingRod");

  return fishingRods.map((fishingRod) => getFishingRodById(fishingRod.itemId));
}

/**
 * Adds a specified fishing rod to a user's inventory, optionally equipping it.
 *
 * This function retrieves the fishing rod by its name and updates or creates an entry
 * in the user's inventory for the specified guild. By default, the fishing rod is equipped.
 *
 * @param userId The Id of the user to whom the fishing rod will be added.
 * @param guildId The Id of the guild in which the user's inventory will be updated.
 * @param fishingRodName The name of the fishing rod to be added.
 * @param [equipped=true] Whether the fishing rod should be equipped by default.
 */
export async function addFishingRodToUserInventory(
  userId: string,
  guildId: string,
  fishingRodName: FishingRodNames,
  equipped: boolean = true
): Promise<UserInventoryInstance> {
  const fishingRod = getFishingRodByName(fishingRodName);
  return await updateOrCreateUserItem({
    userId,
    guildId,
    itemId: fishingRod.id,
    itemType: "FishingRod",
    equipped,
  });
}
