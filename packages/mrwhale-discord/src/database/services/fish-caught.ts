import { FishRarity } from "@mrwhale-io/core";
import { FishCaught, FishCaughtInstance } from "../models/fish-caught";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";

/**
 * Gets the number of a specific type of fish caught by the user in a guild.
 */
export async function getFishCaughtByUserInGuild(
  userId: string,
  guildId: string,
  fishId: number,
  rarity: FishRarity
): Promise<FishCaughtInstance> {
  return await FishCaught.findOne({
    where: { userId, guildId, fishId, rarity },
  });
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
 * Creates a new fish caught record.
 * This is used for logging fish caught by a user in a given guild.
 */
export async function logFishCaught(
  userId: string,
  guildId: string,
  fishId: number,
  rarity: FishRarity
): Promise<FishCaughtInstance> {
  const fishCaught = await getFishCaughtByUserInGuild(
    userId,
    guildId,
    fishId,
    rarity
  );

  if (fishCaught) {
    fishCaught.quantity++;
    fishCaught.save();
  } else {
    await FishCaught.create({ userId, guildId, fishId, rarity, quantity: 1 });
  }

  return fishCaught;
}

export async function getFishCaughtByRarity(
  userId: string,
  guildId: string
): Promise<{ [key in FishRarity]: number } & { total: number }> {
  const fishCaught = await FishCaught.findAll({
    where: { userId, guildId },
  });

  return fishCaught.reduce(
    (acc, fish) => {
      if (!acc[fish.rarity]) {
        acc[fish.rarity] = 0;
      }
      acc[fish.rarity] += fish.quantity;
      acc.total += fish.quantity;
      return acc;
    },
    { total: 0 } as { [key in FishRarity]: number } & {
      total: number;
    }
  );
}
