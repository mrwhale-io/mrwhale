import { ItemTypes } from "@mrwhale-io/core";
import { Inventory, InventoryInstance } from "../models/inventory";

/**
 * Fetch all items of from the inventory for the given user.
 * @param userId The id of the user the item belongs to.
 */
export async function getUserItemsFromInventory(
  userId: string
): Promise<InventoryInstance[]> {
  return await Inventory.findAll({
    where: {
      userId,
    },
  });
}

/**
 * Fetch all items of a particular type for the given user.
 * @param userId The id of the user the item belongs to.
 * @param itemType The type of inventory item.
 */
export async function getUserItemsByType(
  userId: string,
  itemType: ItemTypes
): Promise<InventoryInstance[]> {
  return await Inventory.findAll({
    where: {
      userId,
      itemType,
    },
  });
}

/**
 * Fetch a specific item for the given user.
 * @param userId The id of the user the item belongs to.
 * @param itemName The type of inventory item.
 */
export async function getUserItemByName(
  userId: string,
  itemName: string
): Promise<InventoryInstance> {
  return await Inventory.findOne({
    where: {
      userId,
      itemName,
    },
  });
}

/**
 * Create or update a user inventory record.
 * @param userId The user to create or update inventory item for.
 * @param fishName The name of the item
 */
export async function updateOrCreateUserItem(
  userId: string,
  itemName: string,
  itemType: ItemTypes
): Promise<void> {
  let userItems = await getUserItemByName(userId, itemName);

  if (!userItems) {
    userItems = Inventory.build({
      userId,
      itemName,
      itemType,
      quantity: 0,
    });
  }

  userItems.quantity++;
  userItems.save();
}
