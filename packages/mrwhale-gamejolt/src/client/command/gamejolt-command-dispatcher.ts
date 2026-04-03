import {
  TimeUtilities,
  getCommandName,
  getCommandArgs,
  dispatch,
} from "@mrwhale-io/core";
import { Events, Message, Room } from "@mrwhale-io/gamejolt-client";

import { GameJoltBotClient } from "../gamejolt-bot-client";
import { GameJoltCommand } from "./gamejolt-command";

/**
 * Handles command dispatching and processing for GameJolt chat messages.
 *
 * This class listens for incoming messages, validates them against various criteria
 * (such as blocked users, command existence, permissions, and rate limits), and
 * dispatches valid commands for execution.
 *
 * @example
 * ```typescript
 * const dispatcher = new GameJoltCommandDispatcher(botClient);
 * dispatcher.ready = true; // Enable message processing
 * ```
 */
export class GameJoltCommandDispatcher {
  /**
   * Indicates whether the dispatcher is ready to process messages.
   * This can be used to delay command processing until the bot is fully initialized.
   */
  ready: boolean = false;
  
  constructor(public readonly bot: GameJoltBotClient) {
    this.bot.client.on(Events.MESSAGE, (message) =>
      this.handleMessage(message),
    );
  }

  private async handleMessage(message: Message) {
    try {
      // Ignore messages from the bot itself or if dispatcher is not ready
      if (message.isClientUser || !this.ready) {
        return;
      }

      // Ignore messages from users the bot has blocked
      if (message.isAuthorBlocked) {
        return;
      }

      const prefix = await this.bot.getPrefix(message.room_id);
      if (!message.textContent.trim().startsWith(prefix)) {
        return;
      }

      // Extract the command name from the message and find corresponding command
      const { command, commandName } = this.parseCommandFromMessage(
        message,
        prefix,
      );

      if (!command) {
        // Check for custom commands if no built-in command found
        const customResult = await this.handleCustomCommand(
          message,
          commandName,
        );

        if (customResult) {
          return;
        }

        return message.reply(
          `❓ Unknown command. Use \`${prefix}help\` to view available commands.`,
        );
      }

      // Check if user has permission to execute the command
      const room = this.bot.chat.activeRooms.get(message.room_id);
      if (!this.hasPermissionToExecute(command, message, room)) {
        return; // Error messages are handled within the permission check
      }

      // Check premium access requirements
      if (!(await this.checkPremiumAccess(command, message))) {
        return; // Error messages are handled within the premium check
      }

      // Check rate limits and cooldowns
      if (!this.checkRateLimits(message, command)) {
        return; // Cooldown message is handled within the rate limit check
      }

      // Extract command arguments and execute the command
      const args = getCommandArgs(
        message.textContent,
        prefix,
        command.argSeparator,
      );

      await this.executeCommand(command, message, args);
    } catch (error) {
      this.bot.logger.error("Error while handling message:", error);
    }
  }

  /**
   * Checks if the user has permission to execute the given command.
   * Handles group-only, admin-only, and owner-only command restrictions.
   *
   * @param command The command to check permissions for
   * @param message The message that triggered the command
   * @param room The room where the command was executed
   * @returns true if user has permission, false otherwise (with error message sent)
   */
  private hasPermissionToExecute(
    command: GameJoltCommand,
    message: Message,
    room: Room | undefined,
  ): boolean {
    // Check group-only commands
    if (command.groupOnly && room?.isPmRoom) {
      message.reply("👥 This command can only be used in group chats.");
      return false;
    }

    // Check admin-only commands
    if (command.admin && message.user.id !== this.bot.ownerId) {
      message.reply("🔒 This is an admin-only command.");
      return false;
    }

    // Check owner-only commands
    if (command.owner && !message.isRoomOwner && !room?.isPmRoom) {
      message.reply("👑 You need to be the room owner to use this command.");
      return false;
    }

    return true;
  }

  /**
   * Checks if the user has premium access for commands that require it.
   * Validates subscription status and usage limits for premium features.
   * In development mode, provides bypass options for testing.
   *
   * @param command The command to check premium access for
   * @param message The message that triggered the command
   * @returns true if user has access, false otherwise (with error message sent)
   */
  private async checkPremiumAccess(
    command: GameJoltCommand,
    message: Message,
  ): Promise<boolean> {
    // Skip check if command doesn't require premium access
    if (!command.requiresPremium && !command.premiumTier) {
      return true;
    }

    // In development mode, allow bot owner to bypass premium checks for testing
    if (this.isDevelopmentMode() && message.user.id === this.bot.ownerId) {
      this.bot.logger.debug(
        `Premium bypass: Owner testing command '${command.name}'`,
      );
      return true;
    }

    if (!this.bot.subscriptionManager) {
      message.reply(
        "❌ **Premium features not available**\n" +
          "Subscription system is not configured on this bot instance.",
      );
      return false;
    }

    try {
      const userTier =
        await this.bot.subscriptionManager.getUserSubscriptionTier(
          message.user.id,
        );

      // Check if user has required subscription tier
      if (command.premiumTier && userTier === "free") {
        const requiredTier = command.premiumTier.toUpperCase();
        message.reply(
          `💎 **${requiredTier} Required**\n\n` +
            `This command requires a ${requiredTier} subscription.\n\n` +
            `🎯 **Upgrade to unlock:**\n` +
            `• Use \`!subscribe\` to view premium plans\n` +
            `• Get access to exclusive features\n` +
            `• Support continued development`,
        );
        return false;
      }

      // Check if user has specific premium tier required
      if (command.premiumTier === "pro" && userTier !== "pro") {
        message.reply(
          `👑 **PRO Subscription Required**\n\n` +
            `This AI-powered command requires a PRO subscription.\n\n` +
            `🚀 **PRO Features:**\n` +
            `• 100 custom commands daily\n` +
            `• AI-powered effects and analysis\n` +
            `• Animated GIF outputs\n` +
            `• Priority support\n\n` +
            `Use \`!subscribe pro your@email.com\` to upgrade!`,
        );
        return false;
      }

      // Check usage limits for premium commands
      if (command.requiresPremium) {
        const usageType =
          command.type === "image" ? "imageEffects" : "customCommands";
        const hasExceededLimit =
          await this.bot.subscriptionManager.checkUsageLimit(
            message.user.id,
            usageType,
          );

        if (hasExceededLimit) {
          const usage = await this.bot.subscriptionManager.getRemainingUsage(
            message.user.id,
          );
          const limitType =
            usageType === "imageEffects" ? "effects" : "commands";
          const currentLimit =
            usageType === "imageEffects"
              ? usage.effectLimit
              : usage.commandLimit;

          message.reply(
            `⏰ **Daily Limit Reached**\n\n` +
              `You've used all ${currentLimit} ${limitType} for today.\n\n` +
              `💡 **Solutions:**\n` +
              `• Wait until tomorrow (resets at midnight)\n` +
              `• Upgrade to premium for higher limits\n` +
              `• Use \`!usage\` to check your current usage`,
          );
          return false;
        }

        // Track usage for premium features (skip in development mode)
        if (!this.isDevelopmentMode()) {
          await this.bot.subscriptionManager.trackUsage(
            message.user.id,
            usageType,
          );
        }
      }

      return true;
    } catch (error) {
      this.bot.logger.error("Premium access check failed:", error);
      message.reply(
        "❌ **Error checking premium access**\n" +
          "There was an error verifying your subscription. Please try again later.",
      );
      return false;
    }
  }

  /**
   * Checks and applies rate limiting for a command.
   *
   * @param message The message that triggered the command
   * @param command The command to check rate limits for
   * @returns true if command can proceed, false if rate limited
   */
  private checkRateLimits(message: Message, command: GameJoltCommand): boolean {
    const rateLimit = command.rateLimiter.get(message);

    if (!rateLimit.isRateLimited) {
      rateLimit.call();
      return true;
    }

    // Show cooldown message only once
    if (!rateLimit.wasNotified) {
      rateLimit.setNotified();
      const timeLeft = TimeUtilities.difference(
        rateLimit.expires,
        Date.now(),
      ).toString();

      if (timeLeft) {
        message.reply(`⏱️ Command cooldown. Try again in ${timeLeft}.`);
      }
    }

    return false;
  }

  /**
   * Executes a command with proper error handling and timeout protection.
   *
   * @param command The command to execute
   * @param message The message that triggered the command
   * @param args The command arguments
   */
  private async executeCommand(
    command: GameJoltCommand,
    message: Message,
    args: string[],
  ): Promise<void> {
    try {
      // Create timeout promise (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Command execution timeout")), 30000),
      );

      // Execute command with timeout protection
      await Promise.race([dispatch(command, message, args), timeoutPromise]);

      // Log successful execution
      this.bot.logger.info(
        `${message.user.username} (${message.user.id}) executed '${command.name}'`,
      );
    } catch (error) {
      this.bot.logger.error(`Command '${command.name}' failed:`, error);
      this.sendErrorFeedback(message, error);
    }
  }

  /**
   * Sends user-friendly error feedback based on the error type.
   *
   * @param message The message to reply to
   * @param error The error that occurred
   */
  private sendErrorFeedback(message: Message, error: unknown): void {
    if (!(error instanceof Error)) {
      message.reply("❌ An unexpected error occurred. Please try again later.");
      return;
    }

    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("timeout")) {
      message.reply("⏰ Command timed out. Please try again later.");
    } else if (
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("connection")
    ) {
      message.reply(
        "🌐 Network error. Please check your connection and try again.",
      );
    } else if (
      errorMessage.includes("permission") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("forbidden")
    ) {
      message.reply(
        "🚫 Permission denied. You don't have access to this resource.",
      );
    } else if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests")
    ) {
      message.reply("🚦 Rate limited. Please wait before trying again.");
    } else {
      message.reply("❌ Command failed to execute. Please try again later.");
    }
  }

  /**
   * Handles custom commands defined by users in the room.
   * Checks for matching custom commands and executes them if found.
   * @param message The message that triggered the command
   * @param commandName The name of the custom command
   * @returns true if custom command was found and handled, false otherwise
   */
  private async handleCustomCommand(
    message: Message,
    commandName: string,
  ): Promise<boolean> {
    try {
      const roomCommands =
        await this.bot.customCommandManager.getRoomCustomCommands(
          message.room_id,
        );

      // Check for exact match first
      let command = roomCommands.commands.get(commandName.toLowerCase());

      // If no exact match, check aliases
      if (!command) {
        for (const [, cmd] of roomCommands.commands) {
          if (cmd.aliases.includes(commandName.toLowerCase())) {
            command = cmd;
            break;
          }
        }
      }

      if (!command || !command.enabled) {
        return false;
      }

      // Execute the custom command
      const response = await this.bot.customCommandManager.executeCustomCommand(
        command,
        message,
      );

      if (response) {
        const sentMessage = await message.reply(response);

        // Handle auto-delete if configured
        if (command.behavior.autoDelete > 0) {
          setTimeout(async () => {
            try {
              await sentMessage.delete();
            } catch (error) {
              // Silently ignore deletion errors
            }
          }, command.behavior.autoDelete);
        }

        // Delete trigger message if configured
        if (command.behavior.deleteTrigger) {
          try {
            await message.delete();
          } catch (error) {
            // Silently ignore deletion errors
          }
        }
      }

      return true;
    } catch (error) {
      this.bot.logger.error("Error handling custom command:", error);
      message.reply("❌ Error executing custom command.");
      return true; // Return true to prevent "unknown command" message
    }
  }

  /**
   * Parses the command name from the message content and finds the corresponding command object.
   *
   * @param message The message containing the command
   * @param prefix The command prefix for the room
   * @returns An object containing the found command and the extracted command name
   */
  private parseCommandFromMessage(message: Message, prefix: string) {
    const commandName = getCommandName(message.textContent, prefix);
    const command = this.bot.commands.findByNameOrAlias(commandName);
    return { command, commandName };
  }

  /**
   * Checks if the bot is running in development mode.
   * Development mode allows bypassing premium checks for testing.
   *
   * @returns true if in development mode
   */
  private isDevelopmentMode(): boolean {
    return (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "dev" ||
      process.env.DEV === "true" ||
      this.bot.isDevelopment
    );
  }
}
