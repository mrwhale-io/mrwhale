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

  /**
   * Sets the balance for a specific user in a specific guild.
   *
   * This method updates the user's balance in the local cache for the specified guild.
   * If the guild does not have any cached balances yet, it initializes an empty object for that guild.
   * Then it sets the user's balance to the provided value.
   *
   * @param userId The Id of the user whose balance is being set.
   * @param guildId The Id of the guild where the user's balance is being set.
   * @param balance The new balance to be set for the user.
   */
  setUserBalance(userId: string, guildId: string, balance: number): void {
    if (!this.usersBalances[guildId]) {
      this.usersBalances[guildId] = {};
    }

    this.usersBalances[guildId][userId] = balance;
  }

  /**
   * Deletes all balances for a particular user across all guilds.
   *
   * @param userId The Id of the user whose balances are to be deleted.
   */
  deleteUserBalances(userId: string): void {
    for (const guildId in this.usersBalances) {
      if (this.usersBalances[guildId].hasOwnProperty(userId)) {
        delete this.usersBalances[guildId][userId];
      }
    }
  }

  /**
   * Deletes the balance for a particular user in a specific guild.
   *
   * @param userId The Id of the user whose balance is to be deleted.
   * @param guildId The Id of the guild where the user's balance is to be deleted.
   */
  deleteUserBalanceInGuild(userId: string, guildId: string): void {
    if (
      this.usersBalances[guildId] &&
      this.usersBalances[guildId].hasOwnProperty(userId)
    ) {
      delete this.usersBalances[guildId][userId];
    }
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
}
