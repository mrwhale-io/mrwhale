import { Client, User } from "discord.js";

import { UserBalance } from "../models/user-balance";
import { Score } from "../models/score";
import { UserInventory } from "../models/user-inventory";
import { FishCaught } from "../models/fish-caught";
import { database } from "..";
import { UserAchievement } from "../models/user-achievement";
import { FishFed } from "../models/fish-fed";

/**
 * Fetches a user by their ID from the Discord client.
 *
 * This function first checks if the user is already present in the client's cache.
 * If the user is found in the cache, it returns the cached user.
 * If the user is not found in the cache, it attempts to fetch the user from the Discord API.
 * If the user cannot be fetched (e.g., the user does not exist or the bot lacks permissions),
 * it returns null.
 *
 * @param client The Discord client instance.
 * @param userId The ID of the user to fetch.
 * @returns A Promise that resolves to the User object if found, otherwise null.
 */
export async function fetchUser(
  client: Client,
  userId: string
): Promise<User | null> {
  try {
    if (client.users.cache.has(userId)) {
      return client.users.cache.get(userId);
    } else {
      return await client.users.fetch(userId);
    }
  } catch {
    return null;
  }
}

/**
 * Resets all user data for a given user ID and optional guild ID.
 * This includes deleting the user's balance, score, inventory, and fish caught records.
 *
 * @param userId The Id of the user whose data is to be reset.
 * @param [guildId] The Id of the guild. If provided, only data related to this guild will be deleted. Otherwise, data across all guilds will be deleted.
 * @returns A promise that resolves when the operation is complete.
 * @throws Throws an error if the data reset operation fails.
 */
export async function resetUserData(
  userId: string,
  guildId?: string
): Promise<void> {
  // Start a new transaction to ensure all deletions succeed or fail together.
  const transaction = await database.connection.transaction();

  try {
    const whereClause = guildId ? { userId, guildId } : { userId };

    await UserBalance.destroy({ where: whereClause });
    await Score.destroy({ where: whereClause });
    await UserInventory.destroy({ where: whereClause });
    await FishCaught.destroy({ where: whereClause });
    await FishFed.destroy({ where: whereClause });
    await UserAchievement.destroy({ where: whereClause });

    await transaction.commit();
  } catch (error) {
    transaction.rollback();
    throw new Error("An error occurred while resetting user data.");
  }
}
