import { ItemTypes } from "@mrwhale-io/core";
import { UserInventory, UserInventoryInstance } from "../models/user-inventory";

/**
 * Fetch all items of from the inventory for the given user.
 * @param userId The id of the user the item belongs to.
 */
export async function getUserItemsFromInventory(
  userId: string
): Promise<UserInventoryInstance[]> {
  return UserInventory.findAll({
    where: {
      userId,
    },
  });
}

/**
 * Fetch all items of a particular type for the given user.
 * @param userId The id of the user the item belongs to.
 * @param itemType The type of the inventory item.
 */
export async function getUserItemsByType(
  userId: string,
  itemType: ItemTypes
): Promise<UserInventoryInstance[]> {
  return UserInventory.findAll({
    where: {
      userId,
      itemType,
    },
  });
}

/**
 * Fetch a specific item for the given user.
 * @param userId The id of the user the item belongs to.
 * @param itemId The id of inventory item.
 * @param itemType The type of the inventory item.
 */
export async function getUserItemById(
  userId: string,
  itemId: number,
  itemType: ItemTypes
): Promise<UserInventoryInstance> {
  return UserInventory.findOne({
    where: {
      userId,
      itemType,
      itemId,
    },
  });
}

/**
 * Create or update a user inventory record.
 * @param userId The owner of the item.
 * @param itemId The id of the item to create.
 * @param itemType The type of the inventory item to create.
 * @param equipped Whether the user is equipped with this item.
 */
export async function updateOrCreateUserItem(
  userId: string,
  itemId: number,
  itemType: ItemTypes,
  equipped: boolean = false
): Promise<void> {
  let userItems = await getUserItemById(userId, itemId, itemType);

  if (!userItems) {
    userItems = UserInventory.build({
      userId,
      itemId,
      itemType,
      quantity: 0,
      equipped,
    });
  }

  userItems.quantity++;
  userItems.save();
}
