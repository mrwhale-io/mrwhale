import { FishFed, FishFedInstance } from "../models/fish-fed";

/**
 * Retrieves the fish fed by a user in a specific guild.
 *
 * @param userId The Id of the user.
 * @param guildId The Id of the guild.
 * @returns A promise that resolves to the FishFed instance or null if no record is found.
 */
export async function getFishFedByUserInGuild(
  userId: string,
  guildId: string
): Promise<FishFedInstance> {
  return await FishFed.findOne({
    where: {
      userId,
      guildId,
    },
  });
}

/**
 * Logs the quantity of fish fed by a user in a specific guild.
 *
 * This function checks if there is an existing record of the fish fed by the user in the guild.
 * If a record exists, it updates the quantity. If no record exists, it creates a new record.
 *
 * @param userId The Id of the user.
 * @param guildId The Id of the guild.
 * @param quantity The quantity of fish fed.
 * @returns A promise that resolves once the operation is complete.
 */
export async function logFishFed(
  userId: string,
  guildId: string,
  quantity: number
): Promise<void> {
  let fishFed = await getFishFedByUserInGuild(userId, guildId);

  if (!fishFed) {
    fishFed = FishFed.build({
      userId,
      guildId,
      quantity: 0,
    });
  }

  fishFed.quantity += quantity;
  fishFed.save();
}
