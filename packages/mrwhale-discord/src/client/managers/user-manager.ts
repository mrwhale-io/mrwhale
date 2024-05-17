import { Collection } from "discord.js";

import { DiscordBotClient } from "../discord-bot-client";
import { User, UserInstance } from "../../database/models/user";
import { addFishingRodToUserItems } from "../../database/services/fishing-rods";

export class UserManager {
  readonly users: Collection<string, UserInstance>;

  constructor(private bot: DiscordBotClient) {
    this.users = new Collection<string, UserInstance>();
  }

  /**
   * Add given amount to the user's balance.
   * @param userId The user to update for.
   * @param amount The amount to increase the balance by.
   */
  async addToUserBalance(
    userId: string,
    amount: number
  ): Promise<UserInstance> {
    await this.storeUser(userId);
    const user = this.users.get(userId);

    if (user) {
      user.balance += amount;
      user.save();
    }

    return user;
  }

  async storeUser(userId: string): Promise<void> {
    if (!this.users.has(userId)) {
      try {
        const user = await this.getOrCreateUser(userId);
        this.users.set(userId, user);
      } catch (error) {
        this.bot.logger.error("Error storing user:", error);
      }
    }
  }

  private async getOrCreateUser(userId: string): Promise<UserInstance> {
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
}
