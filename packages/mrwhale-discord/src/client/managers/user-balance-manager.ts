import {
  UserBalance,
  UserBalanceInstance,
} from "../../database/models/user-balance";

interface UserBalanceMap {
  [guildId: number]: { [user: number]: number };
}

export class UserBalanceManager {
  private usersBalances: UserBalanceMap;

  constructor() {
    this.usersBalances = {};
  }

  /**
   * Retrieves the user's balance for a specific guild from the cache, or creates it if it doesn't exist.
   *
   * This method first checks the cache for the user's balance in the specified guild. If the guild or
   * user's balance does not exist in the cache, it retrieves or creates the user's balance from the database
   * and updates the cache. The method ensures that the balance is always available, defaulting to 0 if not found.
   *
   * @param userId The Id of the user whose balance is being retrieved.
   * @param guildId The Id of the guild where the balance is being checked.
   */
  async getUserBalance(userId: string, guildId: string): Promise<number> {
    if (!this.usersBalances[guildId]) {
      this.usersBalances[guildId] = {};
    }

    if (!this.usersBalances[guildId][userId]) {
      await this.getOrCreateUserBalance(userId, guildId);
    }

    return this.usersBalances[guildId][userId] || 0;
  }

  /**
   * Adds a specified amount to the user's balance.
   *
   * This method retrieves or creates the user's balance record for the specified guild,
   * updates the user's balance by adding the specified amount, and then saves the updated balance
   * to the database. The updated balance is also cached for quick access.
   *
   * @param userId The Id of the user whose balance is being updated.
   * @param guildId The Id of the guild where the balance update is taking place.
   * @param amount The amount to add to the user's balance.
   */
  async addToUserBalance(
    userId: string,
    guildId: string,
    amount: number
  ): Promise<UserBalanceInstance> {
    const userBalance = await this.getOrCreateUserBalance(userId, guildId);

    if (userBalance) {
      userBalance.balance += amount;
      userBalance.save();
      this.setUserBalance(userId, guildId, userBalance.balance);
    }

    return userBalance;
  }

  private async getOrCreateUserBalance(
    userId: string,
    guildId: string
  ): Promise<UserBalanceInstance> {
    let userBalance = await UserBalance.findOne({
      where: {
        userId,
        guildId,
      },
    });

    if (!userBalance) {
      userBalance = await UserBalance.create({
        userId,
        guildId,
        balance: 0,
      });
    }

    this.setUserBalance(userId, guildId, userBalance.balance);

    return userBalance;
  }

  private setUserBalance(
    userId: string,
    guildId: string,
    balance: number
  ): void {
    if (!this.usersBalances[guildId]) {
      this.usersBalances[guildId] = {};
    }

    this.usersBalances[guildId][userId] = balance;
  }
}
