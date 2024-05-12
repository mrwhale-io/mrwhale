import { FishTypeNames } from "@mrwhale-io/core";
import { FishCaught, FishCaughtInstance } from "../models/fish-caught";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";

/**
 * Gets the number of a specific type of fish caught by the user in a guild.
 */
export async function getFishCaughtByUserInGuild(
  userId: string,
  guildId: string
): Promise<FishCaughtInstance> {
  return await FishCaught.findOne({
    where: {
      userId,
      guildId,
    },
  });
}

/**
 * Gets the number of fish caught by the user in a guild.
 */
export async function getAllFishCaughtByUserInGuild(
  userId: string,
  guildId: string
): Promise<FishCaughtInstance[]> {
  return await FishCaught.findAll({ where: { userId, guildId } });
}

/**
 * Gets the number of fish caught in a guild.
 */
export async function getAllFishCaughtByGuild(
  guildId: string,
  page: number
): Promise<{ count: number; rows: FishCaughtInstance[] }> {
  const { count, rows } = await FishCaught.findAndCountAll({
    where: { guildId },
    limit: HIGHSCORE_PAGE_LIMIT,
    offset: HIGHSCORE_PAGE_LIMIT * (page - 1),
    order: [["quantity", "DESC"]],
  });
  return { count, rows };
}

/**
 * Creates a new  fish caught record.
 * This is used for logging fish caught by a user in a given guild.
 */
export async function logFishCaught(
  userId: string,
  guildId: string
): Promise<void> {
  let fishCaught = await getFishCaughtByUserInGuild(userId, guildId);

  if (!fishCaught) {
    fishCaught = FishCaught.build({
      userId,
      guildId,
      quantity: 0,
    });
  }

  fishCaught.quantity++;
  fishCaught.save();
}
