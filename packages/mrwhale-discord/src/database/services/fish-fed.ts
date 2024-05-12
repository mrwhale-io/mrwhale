import { FishFed, FishFedInstance } from "../models/fish-fed";

/**
 * Gets the number of a specific type of fish fed by the user in a guild.
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
 * Gets the total number of fish fed in the guild.
 */
export async function getTotalFishFedInGuild(guildId: string): Promise<number> {
  const totalOfFish = await FishFed.sum("quantity", {
    where: { guildId },
  });

  return totalOfFish;
}

/**
 * Creates a new fish fed record.
 * This is used for logging fish fed by a user in a given guild.
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
