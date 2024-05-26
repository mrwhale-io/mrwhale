import { Bait, getBaitById } from "@mrwhale-io/core";
import { UserInventory } from "../models/user-inventory";

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
