import { Message } from "@mrwhale-io/gamejolt-client";
import { CommandRateLimit } from "@mrwhale-io/core";

/**
 * A rate limiter for custom commands that supports dynamic cooldowns per command.
 * Tracks cooldowns per user, per room, per command name.
 */
export class CustomCommandRateLimiter {
  // Maps: roomId -> userId -> commandName -> CommandRateLimit
  private readonly rateLimits: Map<
    number,
    Map<number, Map<string, CommandRateLimit>>
  >;

  constructor() {
    this.rateLimits = new Map();
  }

  /**
   * Retrieves the rate limit for a specific user, room, and custom command.
   * Creates new rate limit instances as needed with the command's specific cooldown.
   *
   * @param message - The message object containing room_id and user info
   * @param commandName - The name of the custom command
   * @param cooldownMs - The cooldown duration in milliseconds for this command
   * @returns The CommandRateLimit instance for this specific combination
   */
  get(
    message: Message,
    commandName: string,
    cooldownMs: number,
  ): CommandRateLimit {
    // Ensure room map exists
    if (!this.rateLimits.has(message.room_id)) {
      this.rateLimits.set(message.room_id, new Map());
    }

    const roomLimits = this.rateLimits.get(message.room_id);

    // Ensure user map exists within room
    if (!roomLimits.has(message.user.id)) {
      roomLimits.set(message.user.id, new Map());
    }

    const userLimits = roomLimits.get(message.user.id);

    // Ensure command rate limit exists, create with command-specific cooldown
    if (!userLimits.has(commandName)) {
      userLimits.set(commandName, new CommandRateLimit(1, cooldownMs));
    }

    return userLimits.get(commandName);
  }

  /**
   * Checks if a command is currently on cooldown for the user.
   *
   * @param message - The message object
   * @param commandName - The name of the custom command
   * @param cooldownMs - The cooldown duration in milliseconds
   * @returns true if command can be executed, false if on cooldown
   */
  canExecute(
    message: Message,
    commandName: string,
    cooldownMs: number,
  ): boolean {
    const rateLimit = this.get(message, commandName, cooldownMs);
    return !rateLimit.isRateLimited;
  }

  /**
   * Executes a command (marks it as used) and starts its cooldown.
   *
   * @param message - The message object
   * @param commandName - The name of the custom command
   * @param cooldownMs - The cooldown duration in milliseconds
   * @returns The rate limit object with updated state
   */
  execute(
    message: Message,
    commandName: string,
    cooldownMs: number,
  ): CommandRateLimit {
    const rateLimit = this.get(message, commandName, cooldownMs);
    rateLimit.call();
    return rateLimit;
  }

  /**
   * Gets the remaining cooldown time for a command in milliseconds.
   *
   * @param message - The message object
   * @param commandName - The name of the custom command
   * @param cooldownMs - The cooldown duration in milliseconds
   * @returns Remaining cooldown in milliseconds, or 0 if not on cooldown
   */
  getRemainingCooldown(
    message: Message,
    commandName: string,
    cooldownMs: number,
  ): number {
    const rateLimit = this.get(message, commandName, cooldownMs);
    if (!rateLimit.isRateLimited) {
      return 0;
    }
    return Math.max(0, rateLimit.expires - Date.now());
  }

  /**
   * Clears rate limits for a specific room (useful for cleanup).
   *
   * @param roomId - The room ID to clear limits for
   */
  clearRoom(roomId: number): void {
    this.rateLimits.delete(roomId);
  }

  /**
   * Clears all rate limits (useful for bot restart/cleanup).
   */
  clearAll(): void {
    this.rateLimits.clear();
  }
}
