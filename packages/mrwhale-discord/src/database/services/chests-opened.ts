import { ChestsOpened, ChestsOpenedInstance } from "../models/chests-opened";

/**
 * Retrieves the total number of chests opened in a specific guild.
 *
 * @param guildId The unique identifier of the guild.
 * @returns A promise that resolves to the total number of chests opened in the guild.
 */
export async function getTotalChestsOpenedInGuild(
  guildId: string
): Promise<number> {
  const totalChestsOpened = await ChestsOpened.sum("quantity", {
    where: { guildId },
  });

  return totalChestsOpened || 0;
}

/**
 * Logs the opening of a chest by a user in a specific guild.
 *
 * This function checks if there is already a record of chests opened by the user in the given guild.
 * If a record exists, it increments the quantity of chests opened.
 * If no record exists, it creates a new record with a quantity of 1.
 *
 * @param userId The ID of the user who opened the chest.
 * @param guildId The ID of the guild where the chest was opened.
 * @returns A promise that resolves when the operation is complete.
 */
export async function logChestOpened(
  userId: string,
  guildId: string
): Promise<void> {
  const chestOpened = await getChestsOpenedForGuildUser(userId, guildId);

  if (chestOpened) {
    chestOpened.quantity++;
    chestOpened.save();
  } else {
    await ChestsOpened.create({ userId, guildId, quantity: 1 });
  }
}

/**
 * Retrieves the total number of chests opened by a specific user in a guild.
 *
 * @param userId The ID of the user.
 * @param guildId The ID of the guild.
 * @returns A promise that resolves to the total number of chests opened by the user in the guild.
 */
async function getChestsOpenedForGuildUser(
  userId: string,
  guildId: string
): Promise<ChestsOpenedInstance> {
  return await ChestsOpened.findOne({
    where: { userId, guildId },
  });
}
