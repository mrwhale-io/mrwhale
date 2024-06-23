import { Op } from "sequelize";

import { ItemTypes } from "@mrwhale-io/core";
import { UserInventory, UserInventoryInstance } from "../models/user-inventory";
import { FishingRod } from "../models/fishing-rod";
import { Bait } from "../models/bait";

interface UserItemCreateOptions {
  userId: string;
  guildId: string;
  itemId: number;
  itemType: ItemTypes;
  equipped?: boolean;
  quantity?: number;
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
 * @param options.quantity The number of items to buy.
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
  quantity = 1,
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

  userItem.quantity += quantity;
  userItem.save();

  return userItem;
}

/**
 * Equips a specified item for the user in the given guild.
 * This function ensures that any previously equipped item of the same type is unequipped
 * before equipping the new item.
 *
 * @param userId The Id of the user equipping the item.
 * @param guildId The Id of the guild where the item is being equipped.
 * @param inventoryItem The inventory item instance to be equipped.
 * @returns A promise that resolves when the item has been equipped.
 */
export async function equipUserItem(
  userId: string,
  guildId: string,
  inventoryItem: UserInventoryInstance
): Promise<void> {
  // Unequip any currently equipped items of the same type
  await UserInventory.update(
    { equipped: false },
    {
      where: {
        userId,
        guildId,
        itemType: inventoryItem.itemType,
        equipped: true,
      },
    }
  );

  // Equip the new item
  inventoryItem.equipped = true;
  await inventoryItem.save();
}

/**
 * Uses the specified item for the user in the given guild.
 *
 * Decreases the quantity of the item by the quantity passed in and removes the inventory item if
 * there are no more in their inventory.
 *
 * @param userId The Id of the user using the item.
 * @param guildId The Id of the guild where the item is being used.
 * @param inventoryItem The inventory item instance to be used.
 * @param quantity The number of items to use.
 */
export async function useUserItem(
  userId: string,
  guildId: string,
  inventoryItem: UserInventoryInstance,
  quantity: number
): Promise<void> {
  inventoryItem.quantity -= quantity;
  await inventoryItem.save();

  if (inventoryItem.quantity <= 0) {
    UserInventory.destroy({
      where: {
        userId,
        guildId,
        itemType: inventoryItem.itemType,
        itemId: inventoryItem.itemId,
      },
    });
  }
}

/**
 * Retrieves a specific item from the user's inventory based on the name of the item.
 *
 * This function queries the user's inventory within a specific guild to find an item matching
 * the specified item name. If the item is found, it returns the corresponding
 * UserInventoryInstance. This can be used to check if a user possesses a particular item
 * within a specific guild and to retrieve details about that item.
 *
 * @param userId The Id of the user whose inventory is being queried.
 * @param guildId The Id of the guild where the inventory is being checked.
 * @param itemName The name of the item being queried.
 */
export async function getUserItemByName(
  userId: string,
  guildId: string,
  itemName: string
): Promise<UserInventoryInstance | null> {
  const inventoryItems = await UserInventory.findAll({
    where: {
      userId,
      guildId,
    },
    include: [
      {
        model: FishingRod,
        as: "fishingRod",
        where: { name: { [Op.like]: itemName } },
        required: false,
      },
      {
        model: Bait,
        as: "bait",
        where: { name: { [Op.like]: itemName } },
        required: false,
      },
    ],
  });

  // Filter the inventory items to find the one that matches the item name
  return (
    inventoryItems.find((item) => {
      if (
        item.itemType === "FishingRod" &&
        item.fishingRod &&
        item.fishingRod.name === itemName
      ) {
        return true;
      }
      if (
        item.itemType === "Bait" &&
        item.bait &&
        item.bait.name === itemName
      ) {
        return true;
      }
      return false;
    }) || null
  );
}
