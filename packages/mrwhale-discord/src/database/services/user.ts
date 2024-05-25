import { DiscordBotClient } from "../../client/discord-bot-client";
import { User, UserInstance } from "../models/user";
import { addFishingRodToUserItems } from "./fishing-rods";

/**
 * Gets an existing user or creates a user if one doesn't exist.
 * @param userId The discord identifier of the user.
 */
export async function getOrCreateUser(userId: string): Promise<UserInstance> {
  let user = await User.findOne({
    where: {
      id: userId,
    },
  });

  if (!user) {
    user = await User.create({
      id: userId,
      balance: 0,
    });

    // Add the basic fishing rod to their inventory.
    await addFishingRodToUserItems(userId, "Basic Fishing Rod");
  }

  return user;
}

/**
 * Add given amount to the user's balance.
 * @param userId The user to update for.
 * @param amount The amount to increase the balance by.
 * @param botClient The discord bot client.
 */
export async function addToUserBalance(
  userId: string,
  amount: number,
  botClient: DiscordBotClient
): Promise<UserInstance> {
  const user = botClient.users.get(userId);

  if (user) {
    user.balance += amount;
    user.save();
  }

  return user;
}
