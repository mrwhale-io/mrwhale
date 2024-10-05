import { FishingRod } from "@mrwhale-io/core";
import { RemainingAttempts } from "../../types/fishing/remaining-attempts";

interface RemainingAttemptsMap {
  [guildId: number]: { [user: number]: RemainingAttempts };
}

const ATTEMPT_REGEN_INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * The attempt tracker is responsible for tracking and updating user fishing attempts.
 */
export class FishingAttemptTracker {
  /**
   * The remaining fishing attempts for each user in the guild.
   */
  private remainingAttempts: RemainingAttemptsMap;

  constructor() {
    this.remainingAttempts = {};
  }

  /**
   * Retrieves the remaining attempts for a user's fishing activity.
   * If the user or guild does not have any recorded attempts, it initializes the attempts with the provided fishing rod's casts value.
   *
   * @param userId The ID of the user.
   * @param guildId The ID of the guild.
   * @param fishingRod The fishing rod used for the attempts.
   * @returns The remaining attempts object for the user.
   */
  getRemainingAttempts(
    userId: string,
    guildId: string,
    fishingRod: FishingRod
  ): RemainingAttempts {
    if (!this.remainingAttempts[guildId]) {
      this.remainingAttempts[guildId] = {};
    }

    if (!this.remainingAttempts[guildId][userId]) {
      this.remainingAttempts[guildId][userId] = {
        lastAttemptTimestamp: Date.now(),
        attempts: fishingRod.casts,
      };
    }

    return this.remainingAttempts[guildId][userId];
  }

  /**
   * Checks whether the user has remaining fishing attempts in the guild.
   * If the user has no remaining attempts, it returns false.
   *
   * @param userId The ID of the user.
   * @param guildId The ID of the guild.
   * @param fishingRod The fishing rod used for the attempts.
   * @returns Whether the user has remaining attempts.
   */
  hasRemainingAttempts(
    userId: string,
    guildId: string,
    fishingRod: FishingRod
  ): boolean {
    const remainingAttempts = this.regenerateFishingAttempts(
      userId,
      guildId,
      fishingRod
    );

    return remainingAttempts.attempts > 0;
  }

  /**
   * Updates the remaining attempts for a user's fishing activity.
   *
   * @param userId The ID of the user.
   * @param guildId The ID of the guild.
   */
  updateAttempts(userId: string, guildId: string): void {
    if (this.remainingAttempts[guildId][userId]) {
      this.remainingAttempts[guildId][userId].attempts--;
      this.remainingAttempts[guildId][userId].lastAttemptTimestamp = Date.now();
    }
  }

  /**
   * Regenerates the fishing attempts for a user and returns the updated remaining attempts.
   *
   * @param userId The ID of the user.
   * @param guildId The ID of the guild.
   * @param fishingRod The fishing rod used for the attempts.
   * @returns The updated remaining attempts after regeneration.
   */
  private regenerateFishingAttempts(
    userId: string,
    guildId: string,
    fishingRod: FishingRod
  ): RemainingAttempts {
    const remainingAttempts = this.getRemainingAttempts(
      userId,
      guildId,
      fishingRod
    );
    const now = Date.now();
    const timeSinceLastAttempt = now - remainingAttempts.lastAttemptTimestamp;
    const attemptsToRegen = Math.floor(
      timeSinceLastAttempt / ATTEMPT_REGEN_INTERVAL
    );

    remainingAttempts.attempts = Math.min(
      remainingAttempts.attempts + attemptsToRegen,
      fishingRod.casts
    );

    return remainingAttempts;
  }
}
