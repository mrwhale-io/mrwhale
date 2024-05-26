import { ItemTypes } from "@mrwhale-io/core";
import { UserInventory, UserInventoryInstance } from "../models/user-inventory";

interface UserItemCreateOptions {
  userId: string;
  guildId: string;
  itemId: number;
  itemType: ItemTypes;
  equipped?: boolean;
}

/**
 * Retrieves all items from a user's inventory in a given guild.
 *
 * This function queries the UserInventory table to find all items that match the given user Id and guild Id.
 * It returns an array of inventory items that belong to the user and match the specified criteria.
 *
 * @param userId The Id of the user whose inventory is being queried.
 * @param guildId The Id of the guild in which the user's inventory is being queried.
 *
 * @returns A promise that resolves to an array of user inventory items for the guild user.
 */
export async function getUserItemsFromInventory(
  userId: string,
  guildId: string
): Promise<UserInventoryInstance[]> {
  return UserInventory.findAll({ where: { userId, guildId } });
}

/**
 * Retrieves all items of a specific type from a user's inventory in a given guild.
 *
 * This function queries the UserInventory table to find all items that match the given user Id,
 * guild ID, and item type. It returns an array of inventory items that belong to the user and
 * match the specified criteria.
 *
 * @param userId The Id of the user whose inventory is being queried.
 * @param guildId The Id of the guild in which the user's inventory is being queried.
 * @param itemType The type of the items to be retrieved (e.g. "FishingRod", "Bait").
 *
 * @returns A promise that resolves to an array of user inventory items of the specified type.
 */
export async function getUserItemsByType(
  userId: string,
  guildId: string,
  itemType: ItemTypes
): Promise<UserInventoryInstance[]> {
  return UserInventory.findAll({ where: { userId, guildId, itemType } });
}

/**
 * Retrieves a specific item from the user's inventory based on the item Id, type, and guild Id.
 *
 * This function queries the user's inventory within a specific guild to find an item matching
 * the specified item Id and type. If the item is found, it returns the corresponding
 * UserInventoryInstance. This can be used to check if a user possesses a particular item
 * within a specific guild and to retrieve details about that item.
 *
 * @param userId The Id of the user whose inventory is being queried.
 * @param guildId The Id of the guild where the inventory is being checked.
 * @param itemId The Id of the item to retrieve from the user's inventory.
 * @param itemType The type of the item to retrieve (e.g. "FishingRod", "Bait").
 */
export async function getUserItemById(
  userId: string,
  guildId: string,
  itemId: number,
  itemType: ItemTypes
): Promise<UserInventoryInstance> {
  return UserInventory.findOne({
    where: { userId, guildId, itemType, itemId },
  });
}

/**
 * Updates the quantity of a user item if it exists, or creates a new item entry if it does not.
 *
 * This function is used to manage the inventory of a user in a specific guild. If the user already
 * has the specified item, the quantity of that item is incremented by one. If the user does not
 * have the item, a new entry is created with a starting quantity of one.
 *
 * @param options The options for creating or updating the user item.
 * @param options.userId The Id of the user.
 * @param options.guildId The Id of the guild.
 * @param options.itemId The Id of the item.
 * @param options.itemType The type of the item (e.g., "FishingRod", "Bait").
 * @param [options.equipped=false] Whether the item is equipped by the user.
 *
 * @returns - A promise that resolves when the item has been updated or created.
 */
export async function updateOrCreateUserItem({
  userId,
  guildId,
  itemId,
  itemType,
  equipped = false,
}: UserItemCreateOptions): Promise<UserInventoryInstance> {
  let userItem = await getUserItemById(userId, guildId, itemId, itemType);

  if (!userItem) {
    userItem = UserInventory.build({
      userId,
      guildId,
      itemId,
      itemType,
      quantity: 0,
      equipped,
    });
  }

  userItem.quantity++;
  userItem.save();

  return userItem;
}
