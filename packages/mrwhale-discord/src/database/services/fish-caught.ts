import { FishRarity } from "@mrwhale-io/core";
import { FishCaught, FishCaughtInstance } from "../models/fish-caught";
import { HIGHSCORE_PAGE_LIMIT } from "../../constants";

/**
 * Retrieves the details of a specific fish caught by a user in a guild.
 *
 * This function fetches the details of a fish catch for a given user in a specific guild,
 * based on the provided fish Id and rarity. It returns the FishCaughtInstance that matches
 * the specified criteria.
 *
 * @param userId The Id of the user whose fish catch details are to be retrieved.
 * @param guildId The Id of the guild where the fish was caught.
 * @param fishId The Id of the fish that was caught.
 * @param rarity The rarity of the fish that was caught (e.g., "Common", "Uncommon", "Rare", "Epic", "Legendary").
 */
export async function getUserFishCatchDetails(
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
 * Retrieves a paginated list of all fish caught in a specific guild.
 *
 * This function fetches the fish caught data for a specified guild, providing
 * pagination support. It returns the total count of records and the rows of
 * fish caught data sorted by quantity in descending order.
 *
 * @param guildId The Id of the guild whose fish catch data is to be retrieved.
 * @param page The page number for pagination.
 * @returns A promise that resolves to an object containing the total count of fish
 *          caught records and an array of FishCaughtInstance objects for the specified page.
 */
export async function getPaginatedGuildFishCaught(
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
 * Gets the sum total of all fish caught by a user in a specific guild.
 *
 * This function queries the `FishCaught` table to find all records that match the given `userId` and `guildId`,
 * and calculates the sum total of the `quantity` field for those records.
 *
 * @param userId The unique identifier of the user whose fish catch total is being retrieved.
 * @param guildId The unique identifier of the guild where the fish were caught.
 * @returns A promise that resolves to the sum total of fish caught by the user in the guild.
 */
export async function getTotalFishCaughtByUserInGuild(
  userId: string,
  guildId: string
) {
  const totalFishCaught = await FishCaught.sum("quantity", {
    where: {
      userId,
      guildId,
    },
  });

  return totalFishCaught || 0;
}

/**
 * Logs a fish catch for a user in a guild, incrementing the quantity if the fish already exists.
 *
 * This function checks if the specified fish (by userId, guildId, fishId, and rarity) is already
 * logged in the database. If it exists, the quantity is incremented by one. If it does not exist,
 * a new record is created with a quantity of one.
 *
 * @param userId The Id of the user who caught the fish.
 * @param guildId The Id of the guild where the fish was caught.
 * @param fishId The Id of the fish that was caught.
 * @param rarity The rarity of the fish that was caught.
 * @returns A promise that resolves to the updated or newly created FishCaughtInstance.
 */
export async function logFishCaught(
  userId: string,
  guildId: string,
  fishId: number,
  rarity: FishRarity
): Promise<FishCaughtInstance> {
  const fishCaught = await getUserFishCatchDetails(
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

/**
 * Retrieves the total quantity of fish caught by a user in a guild, grouped by rarity.
 *
 * This function fetches all the fish catches for a specified user in a given guild
 * and calculates the total quantity of fish caught for each rarity category. It also
 * calculates the overall total quantity of fish caught by the user in the guild.
 *
 * @param userId The Id of the user whose fish catches are to be retrieved.
 * @param guildId The Id of the guild where the fish were caught.
 * @returns A promise that resolves to an object containing the total quantity of fish
 *          caught by rarity and the overall total quantity. The object structure includes
 *          keys for each FishRarity (e.g., "Common", "Uncommon", "Rare", "Epic", "Legendary")
 *          and a `total` key for the overall total.
 */
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
