import * as sequelize from "sequelize";

import { getFishById } from "@mrwhale-io/core";
import { FishFed, FishFedInstance } from "../models/fish-fed";

/**
 * Retrieves the details of a fish fed by a user in a specific guild.
 *
 * @param userId The Id of the user.
 * @param guildId The Id of the guild.
 * @param fishId The Id of the fish that was fed.
 * @returns A promise that resolves to the FishFed instance or null if no record is found.
 */
export async function getFishFedByUserDetails(
  userId: string,
  guildId: string,
  fishId: number
): Promise<FishFedInstance> {
  return await FishFed.findOne({
    where: { userId, guildId, fishId },
  });
}

/**
 * Gets the sum total of all fish fed by a user in a specific guild.
 *
 * This function queries the `FishFed` table to find all records that match the given `guildId`,
 * and calculates the sum total of the `quantity` field for those records.
 *
 * @param guildId The unique identifier of the guild where the fish were fed.
 * @returns A promise that resolves to the sum total of fish fed in the guild.
 */
export async function getTotalFishFedByUserInGuild(
  userId: string,
  guildId: string
): Promise<number> {
  const totalFishFed = await FishFed.sum("quantity", {
    where: { userId, guildId },
  });

  return totalFishFed || 0;
}

/**
 * Gets the sum total of all fish fed by in a specific guild.
 *
 * This function queries the `FishFed` table to find all records that match the given `guildId`,
 * and calculates the sum total of the `quantity` field for those records.
 *
 * @param guildId The unique identifier of the guild where the fish were fed.
 * @returns A promise that resolves to the sum total of fish fed in the guild.
 */
export async function getTotalFishFedInGuild(guildId: string): Promise<number> {
  const totalFishFed = await FishFed.sum("quantity", {
    where: { guildId },
  });

  return totalFishFed || 0;
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
  fishId: number,
  quantity: number
): Promise<void> {
  let fishFed = await getFishFedByUserDetails(userId, guildId, fishId);

  if (!fishFed) {
    fishFed = FishFed.build({
      userId,
      guildId,
      fishId,
      quantity: 0,
    });
  }

  fishFed.quantity += quantity;
  fishFed.save();
}

/**
 * Fetches the most frequently fed fish in a given guild.
 *
 * This function queries the database to determine which type of fish has been fed the most times
 * in the specified guild. It returns the fish with the highest fed count.
 *
 * @param guildId The ID of the guild to find the favorite fish for.
 * @returns A promise that resolves to an object containing the name and icon of the favorite fish.
 */
export async function getFavoriteFish(
  guildId: string
): Promise<{ name: string; icon: string }> {
  const favoriteFishData = await FishFed.findAll({
    attributes: [
      "fishId",
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalFed"],
    ],
    where: {
      guildId,
    },
    group: ["fishId"],
    order: [[sequelize.literal("totalFed"), "DESC"]],
    limit: 1,
  });

  if (favoriteFishData.length === 0) {
    return { name: "No Fish", icon: "❌" };
  }

  const favouriteFishId = favoriteFishData[0].fishId;
  const favouriteFish = getFishById(favouriteFishId);

  return { name: favouriteFish.name, icon: favouriteFish.icon };
}
