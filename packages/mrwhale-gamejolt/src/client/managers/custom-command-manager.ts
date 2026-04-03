import { KeyedStorageProvider, TimeUtilities } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltBotClient } from "../gamejolt-bot-client";
import { CustomCommandRateLimiter } from "../command/custom-command-rate-limiter";
import {
  CustomCommand,
  CustomCommandContext,
  RoomCustomCommands,
  StoredCustomCommandsData,
} from "../../types/custom-command";
import { SubscriptionLimits } from "../../types/subscription-limits";
import { SubscriptionTier } from "../../types/subscription-tiers";

const COMMAND_NAME_MAX_LENGTH = 50;
const COMMAND_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Manager for user-created custom commands in Game Jolt rooms.
 * Handles creation, storage, execution, and permission checks for custom commands.
 */
export class CustomCommandManager {
  readonly rateLimiter: CustomCommandRateLimiter;
  private commandCache: Map<number, RoomCustomCommands>;
  private botClient: GameJoltBotClient;

  constructor(botClient: GameJoltBotClient) {
    this.botClient = botClient;
    this.commandCache = new Map();
    this.rateLimiter = new CustomCommandRateLimiter();
  }

  /**
   * Retrieves custom commands for a room, loading from storage if not cached.
   * Also checks subscription status to apply appropriate limits and permissions.
   * @param roomId The ID of the room to get commands for
   * @return RoomCustomCommands object containing commands, limits, and usage stats
   */
  async getRoomCustomCommands(roomId: number): Promise<RoomCustomCommands> {
    // Check the command cache first
    if (this.commandCache.has(roomId)) {
      return this.commandCache.get(roomId)!;
    }

    // Load settings from room storage
    const settings = await this.getRoomSettings(roomId);
    const subscriptionInfo = await this.getSubscriptionLimits(roomId);

    const storedData = settings.get<StoredCustomCommandsData>(
      "custom_commands",
      {
        commands: {},
        limits: subscriptionInfo.limits,
        totalUsage: 0,
        dailyUsage: {
          date: new Date().toISOString().split("T")[0],
          totalUsage: 0,
          commandUsage: {},
        },
        lastModified: new Date(),
        subscriptionTier: subscriptionInfo.tier,
      },
    );

    // Convert stored data to Map and ensure daily usage is current
    const today = new Date().toISOString().split("T")[0];
    const dailyUsage =
      storedData.dailyUsage.date === today
        ? {
            date: storedData.dailyUsage.date,
            totalUsage: storedData.dailyUsage.totalUsage,
            commandUsage: new Map(
              Object.entries(storedData.dailyUsage.commandUsage),
            ),
          }
        : {
            date: today,
            totalUsage: 0,
            commandUsage: new Map(),
          };

    const roomCommands: RoomCustomCommands = {
      commands: new Map(Object.entries(storedData.commands)),
      limits: subscriptionInfo.limits, // Always use current limits
      totalUsage: storedData.totalUsage,
      dailyUsage,
      lastModified: new Date(storedData.lastModified),
      subscriptionTier: subscriptionInfo.tier,
    };

    this.commandCache.set(roomId, roomCommands);
    return roomCommands;
  }

  /**
   * Gets all commands for a room as an array.
   * @param roomId The ID of the room to get commands for
   * @returns An array of all custom commands in the room
   */
  async getCommands(roomId: number): Promise<CustomCommand[]> {
    const roomCommands = await this.getRoomCustomCommands(roomId);
    return Array.from(roomCommands.commands.values());
  }

  /**
   * Gets only enabled commands for a room as an array.
   * @param roomId The ID of the room to get enabled commands for
   * @returns An array of enabled custom commands in the room
   */
  async getEnabledCommands(roomId: number): Promise<CustomCommand[]> {
    const commands = await this.getCommands(roomId);
    return commands.filter((cmd) => cmd.enabled);
  }

  /**
   * Gets only disabled commands for a room as an array.
   * @param roomId The ID of the room to get disabled commands for
   * @returns An array of disabled custom commands in the room
   */
  async getDisabledCommands(roomId: number): Promise<CustomCommand[]> {
    const commands = await this.getCommands(roomId);
    return commands.filter((cmd) => !cmd.enabled);
  }

  /**
   * Gets commands for a room with pagination support.
   * @param roomId The ID of the room to get commands for
   * @param page The page number (1-based)
   * @param pageSize The number of commands per page
   * @param enabledOnly Whether to only return enabled commands
   * @returns An object with paginated commands and metadata
   */
  async getCommandsPaginated(
    roomId: number,
    page: number = 1,
    pageSize: number = 10,
    enabledOnly: boolean = true,
  ): Promise<{
    commands: CustomCommand[];
    totalCommands: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> {
    const commands = enabledOnly
      ? await this.getEnabledCommands(roomId)
      : await this.getCommands(roomId);

    const validPage = Math.max(1, page);
    const totalPages = Math.ceil(commands.length / pageSize);
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, commands.length);
    const pageCommands = commands.slice(startIndex, endIndex);

    return {
      commands: pageCommands,
      totalCommands: commands.length,
      totalPages,
      currentPage: validPage,
      pageSize,
    };
  }

  /**
   * Creates a new custom command in a room, with validation and permission checks.
   * Checks for command name validity, content length, user permissions, and room subscription limits before creating the command.
   *
   * @param roomId The ID of the room to create the command in
   * @param userId The ID of the user creating the command
   * @param name The name of the command (used to trigger it)
   * @param description A short description of the command (for management purposes)
   * @param content The content that the command will output when executed (supports templates)
   * @param options Additional options for the command such as aliases, cooldown, permissions, and behavior
   * @return An object indicating success or failure, with error messages or the created command
   */
  async createCustomCommand(
    roomId: number,
    userId: number,
    name: string,
    description: string,
    content: string,
    options?: Partial<CustomCommand>,
  ): Promise<{ success: boolean; error?: string; command?: CustomCommand }> {
    try {
      // Validate command name
      const validation = this.validateCommandName(name);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Get room commands
      const roomCommands = await this.getRoomCustomCommands(roomId);

      // Check for duplicates
      if (roomCommands.commands.has(name.toLowerCase())) {
        return {
          success: false,
          error: "A command with that name already exists.",
        };
      }

      // Check if the user can create custom commands based on subscription status and room ownership
      const room = this.botClient.chat.activeRooms.get(roomId);
      const isRoomOwner = room?.owner_id === userId;
      const userSubscription =
        await this.botClient.subscriptionManager.getUserSubscription(userId);
      const hasActiveSubscription = userSubscription?.status === "active";

      if (
        !isRoomOwner &&
        !hasActiveSubscription &&
        !roomCommands.limits.canCreateCommands
      ) {
        return {
          success: false,
          error:
            "Only room owners and premium subscribers can create custom commands. Use `!subscribe` to upgrade.",
        };
      }

      // Check command limit for the room
      if (roomCommands.commands.size >= roomCommands.limits.maxCommands) {
        return {
          success: false,
          error: `Maximum command limit reached (${roomCommands.limits.maxCommands}). Upgrade for more commands.`,
        };
      }

      // Validate command content
      const contentValidation = this.validateCommandContent(
        content,
        roomCommands,
      );
      if (!contentValidation.valid) {
        return { success: false, error: contentValidation.error };
      }

      // Create the command
      const command: CustomCommand = {
        id: this.generateCommandId(),
        name: name.toLowerCase(),
        description: description.slice(0, 200), // Limit description length
        content,
        aliases: options?.aliases || [],
        cooldown: options?.cooldown || 3000,
        permissions: options?.permissions || {
          ownerOnly: false,
          groupOnly: false,
          allowedUsers: [],
          blockedUsers: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        usageCount: 0,
        enabled: true,
        behavior: options?.behavior || {
          responseType: "text",
          deleteTrigger: false,
          mentionUser: false,
          randomResponse: false,
          autoDelete: 0,
        },
      };

      // Store command
      roomCommands.commands.set(command.name, command);
      roomCommands.lastModified = new Date();

      await this.saveRoomCustomCommands(roomId, roomCommands);

      return { success: true, command };
    } catch (error) {
      this.botClient.logger?.error("Failed to create custom command:", error);
      return {
        success: false,
        error: "Failed to create command. Please try again.",
      };
    }
  }

  /**
   * Deletes a custom command from a room with proper permission checks.
   * @param roomId The ID of the room containing the command
   * @param userId The ID of the user attempting to delete the command
   * @param commandName The name of the command to delete
   * @returns An object indicating success or failure with details
   */
  async deleteCustomCommand(
    roomId: number,
    userId: number,
    commandName: string,
  ): Promise<{ success: boolean; error?: string; command?: CustomCommand }> {
    try {
      const roomCommands = await this.getRoomCustomCommands(roomId);
      const command = roomCommands.commands.get(commandName.toLowerCase());

      if (!command) {
        return {
          success: false,
          error: `Custom command '${commandName}' not found.`,
        };
      }

      // Check permissions - room owners and command creators can delete
      const room = this.botClient.chat.activeRooms.get(roomId);
      const isOwner = room?.owner_id === userId;
      const isCreator = command.createdBy === userId;

      if (!isOwner && !isCreator) {
        return {
          success: false,
          error:
            "You can only delete commands you created. Room owners can delete any command.",
        };
      }

      // Remove the command
      const deletedCommand = { ...command };
      roomCommands.commands.delete(commandName.toLowerCase());
      roomCommands.lastModified = new Date();

      // Save changes
      await this.saveRoomCustomCommands(roomId, roomCommands);

      return { success: true, command: deletedCommand };
    } catch (error) {
      this.botClient.logger?.error("Failed to delete custom command:", error);
      return {
        success: false,
        error: "Failed to delete command. Please try again.",
      };
    }
  }

  /**
   * Updates a custom command with new content or settings.
   * @param roomId The ID of the room containing the command
   * @param userId The ID of the user attempting to update the command
   * @param commandName The name of the command to update
   * @param updates Partial command data to update
   * @returns An object indicating success or failure with details
   */
  async updateCustomCommand(
    roomId: number,
    userId: number,
    commandName: string,
    updates: Partial<
      Pick<
        CustomCommand,
        | "content"
        | "description"
        | "aliases"
        | "cooldown"
        | "enabled"
        | "permissions"
        | "behavior"
      >
    >,
  ): Promise<{
    success: boolean;
    error?: string;
    command?: CustomCommand;
    oldValues?: Partial<CustomCommand>;
  }> {
    try {
      const roomCommands = await this.getRoomCustomCommands(roomId);
      const command = roomCommands.commands.get(commandName.toLowerCase());

      if (!command) {
        return {
          success: false,
          error: `Custom command '${commandName}' not found.`,
        };
      }

      // Check permissions - room owners and command creators can edit
      const room = this.botClient.chat.activeRooms.get(roomId);
      const isOwner = room?.owner_id === userId;
      const isCreator = command.createdBy === userId;

      if (!isOwner && !isCreator) {
        return {
          success: false,
          error:
            "You can only edit commands you created. Room owners can edit any command.",
        };
      }

      // Store old values for response
      const oldValues: Partial<CustomCommand> = {};
      if (updates.content !== undefined) oldValues.content = command.content;
      if (updates.description !== undefined)
        oldValues.description = command.description;
      if (updates.enabled !== undefined) oldValues.enabled = command.enabled;

      // Validate updates
      if (updates.content !== undefined) {
        const contentValidation = this.validateCommandContent(
          updates.content,
          roomCommands,
        );
        if (!contentValidation.valid) {
          return { success: false, error: contentValidation.error };
        }
      }

      // Apply updates
      if (updates.content !== undefined) command.content = updates.content;
      if (updates.description !== undefined)
        command.description = updates.description.slice(0, 200);
      if (updates.aliases !== undefined) command.aliases = updates.aliases;
      if (updates.cooldown !== undefined)
        command.cooldown = Math.max(1000, updates.cooldown);
      if (updates.enabled !== undefined) command.enabled = updates.enabled;
      if (updates.permissions !== undefined)
        command.permissions = {
          ...command.permissions,
          ...updates.permissions,
        };
      if (updates.behavior !== undefined)
        command.behavior = { ...command.behavior, ...updates.behavior };

      // Update timestamps
      command.updatedAt = new Date();
      roomCommands.lastModified = new Date();

      // Save changes
      await this.saveRoomCustomCommands(roomId, roomCommands);

      return { success: true, command, oldValues };
    } catch (error) {
      this.botClient.logger?.error("Failed to update custom command:", error);
      return {
        success: false,
        error: "Failed to update command. Please try again.",
      };
    }
  }

  /**
   * Gets a specific command by name from a room.
   * @param roomId The ID of the room to search in
   * @param commandName The name of the command to find
   * @returns The command if found, null otherwise
   */
  async getCommand(
    roomId: number,
    commandName: string,
  ): Promise<CustomCommand | null> {
    const roomCommands = await this.getRoomCustomCommands(roomId);
    return roomCommands.commands.get(commandName.toLowerCase()) || null;
  }

  /**
   * Executes a custom command in response to a message, with all necessary checks and template processing.
   * This method handles permission checks, rate limits, daily usage limits, and processes the command content with template variables before returning the final response.
   * @param command The custom command to execute
   * @param message The message that triggered the command (used for context and permission checks)
   * @param args Optional array of arguments passed to the command (if not provided, will be parsed from the message)
   * @returns The processed command response to send back, or null if execution should be ignored (e.g. due to permissions or cooldowns)
   */
  async executeCustomCommand(
    command: CustomCommand,
    message: Message,
    args?: string[],
  ): Promise<string | null> {
    try {
      // Check permissions
      if (!this.hasPermission(command, message)) {
        return null; // Silently ignore if no permission
      }

      // Check daily usage limits
      const roomCommands = await this.getRoomCustomCommands(message.room_id);
      if (!this.checkDailyUsage(roomCommands)) {
        return "❌ Daily command usage limit reached for this room. Try again tomorrow!";
      }

      // Check cooldown
      if (!this.checkCooldown(command, message)) {
        return null; // Cooldown active, ignore
      }

      // Parse arguments if not provided
      if (!args) {
        const prefix = await this.getPrefix(message.room_id);
        const commandText = message.textContent.slice(prefix.length).trim();
        const commandParts = commandText.split(/\s+/);
        args = commandParts.slice(1); // Remove command name
      }

      // Create context for template variables
      const context = this.createCommandContext(message, args);

      // Process content template
      let processedContent = this.processTemplate(command.content, context);

      // Handle multiple responses (random selection)
      if (command.behavior.randomResponse) {
        const responses = processedContent.split("||").map((r) => r.trim());
        if (responses.length > 1) {
          processedContent =
            responses[Math.floor(Math.random() * responses.length)];
        }
      }

      // Update usage stats
      await this.updateUsageStats(command, message.room_id);

      return processedContent;
    } catch (error) {
      this.botClient.logger?.error("Failed to execute custom command:", error);
      return "❌ Error executing custom command.";
    }
  }

  /**
   * Checks if a command name conflicts with built-in commands.
   * This is used to prevent users from creating custom commands that would override or conflict with existing bot commands.
   * @param name The name of the command to check
   * @returns True if the name conflicts with a built-in command, false otherwise
   */
  commandNameConflicts(name: string): boolean {
    const builtin = this.botClient.commands.findByNameOrAlias(name);
    return builtin !== null && builtin !== undefined;
  }

  /**
   * Clears rate limits for a specific room (useful when room settings change).
   * This ensures that any cooldowns or rate limits are reset, allowing for a fresh start with the new settings.
   * @param roomId The ID of the room to clear rate limits for
   */
  clearRoomRateLimits(roomId: number): void {
    this.rateLimiter.clearRoom(roomId);
  }

  /**
   * Clears all rate limits and command cache (useful for bot restart)
   */
  clearAllCaches(): void {
    this.rateLimiter.clearAll();
    this.commandCache.clear();
  }

  /**
   * Gets the subscription limits for a room based on highest subscription tier.
   * Room owners always get the highest tier limits, followed by any premium users in the room. If no premium subscriptions are found, defaults to free tier limits.
   * @param roomId The ID of the room to check
   * @return An object containing the applicable limits and the subscription tier that provides those limits
   */
  private async getSubscriptionLimits(
    roomId: number,
  ): Promise<{ limits: SubscriptionLimits; tier: SubscriptionTier }> {
    // Check if room owner or any premium users are in the room
    const room = this.botClient.chat.activeRooms.get(roomId);

    if (room) {
      // Check room owner's subscription
      const ownerSubscription =
        await this.botClient.subscriptionManager.getUserSubscription(
          room.owner_id,
        );
      if (ownerSubscription?.status === "active") {
        if (ownerSubscription.tier === "pro") {
          return {
            limits: {
              maxCommands: 100,
              dailyUsage: 2000,
              maxAliases: 10,
              maxContentLength: 2000,
              canCreateCommands: true,
            },
            tier: "pro" as SubscriptionTier,
          };
        } else if (ownerSubscription.tier === "premium") {
          return {
            limits: {
              maxCommands: 25,
              dailyUsage: 500,
              maxAliases: 5,
              maxContentLength: 1500,
              canCreateCommands: true,
            },
            tier: "premium" as SubscriptionTier,
          };
        }
      }

      // Check if any premium users are in the room
      for (const member of room.members.values()) {
        const subscription =
          await this.botClient.subscriptionManager.getUserSubscription(
            member.id,
          );
        if (subscription?.status === "active") {
          if (subscription.tier === "pro") {
            return {
              limits: {
                maxCommands: 50, // Slightly lower than owner limits
                dailyUsage: 1000,
                maxAliases: 8,
                maxContentLength: 1500,
                canCreateCommands: true,
              },
              tier: "pro" as SubscriptionTier,
            };
          } else if (subscription.tier === "premium") {
            return {
              limits: {
                maxCommands: 15,
                dailyUsage: 250,
                maxAliases: 3,
                maxContentLength: 1000,
                canCreateCommands: true,
              },
              tier: "premium" as SubscriptionTier,
            };
          }
        }
      }
    }

    // Default to free tier
    return {
      limits: {
        maxCommands: 5,
        dailyUsage: 50,
        maxAliases: 2,
        maxContentLength: 500,
        canCreateCommands: false,
      },
      tier: "free" as SubscriptionTier,
    };
  }

  /**
   * Validates command name against rules (non-empty, length, characters, conflicts).
   * @param name The name of the command to validate
   * @returns An object indicating whether the name is valid and an optional error message
   */
  private validateCommandName(name: string): {
    valid: boolean;
    error?: string;
  } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: "Command name cannot be empty." };
    }

    if (name.length > COMMAND_NAME_MAX_LENGTH) {
      return {
        valid: false,
        error: `Command name must be ${COMMAND_NAME_MAX_LENGTH} characters or less.`,
      };
    }

    if (!COMMAND_NAME_REGEX.test(name)) {
      return {
        valid: false,
        error:
          "Command name can only contain letters, numbers, dashes, and underscores.",
      };
    }

    if (this.commandNameConflicts(name)) {
      return {
        valid: false,
        error: "Command name conflicts with a built-in command.",
      };
    }

    return { valid: true };
  }

  /**
   * Validates command content against rules (non-empty, length, etc.).
   * @param content The content of the command to validate
   * @param roomCommands The RoomCustomCommands object containing limits for validation
   * @returns An object indicating whether the content is valid and an optional error message
   */
  private validateCommandContent(
    content: string,
    roomCommands: RoomCustomCommands,
  ): { valid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: "Command content cannot be empty." };
    }

    if (content.length > roomCommands.limits.maxContentLength) {
      return {
        valid: false,
        error: `Command content must be ${roomCommands.limits.maxContentLength} characters or less.`,
      };
    }

    // Basic content validation (extend as needed)
    return { valid: true };
  }

  /**
   * Checks if user has permission to use command
   */
  private hasPermission(command: CustomCommand, message: Message): boolean {
    const permissions = command.permissions;

    // Check blocked users
    if (permissions.blockedUsers.includes(message.user.id)) {
      return false;
    }

    // Check allowed users (if specified)
    if (permissions.allowedUsers.length > 0) {
      return permissions.allowedUsers.includes(message.user.id);
    }

    // Check owner only
    if (permissions.ownerOnly && !message.isRoomOwner) {
      return false;
    }

    // Check group only
    const room = this.botClient.chat.activeRooms.get(message.room_id);
    if (permissions.groupOnly && room && !room.isGroupRoom) {
      return false;
    }

    return true;
  }

  /**
   * Checks if a command is on cooldown for the user and room, and updates the cooldown if it can be executed.
   * This is called before executing a command to enforce cooldowns and prevent spamming.
   * If the command is on cooldown, it returns false. If the command can be executed, it starts the cooldown and returns true.
   * @param command The custom command being executed
   * @param message The message object that triggered the command, used to identify the user and room for cooldown tracking
   * @return True if the command can be executed (not on cooldown), false if it is currently on cooldown for the user and room
   */
  private checkCooldown(command: CustomCommand, message: Message): boolean {
    // Check if command can be executed (not on cooldown)
    if (this.rateLimiter.canExecute(message, command.name, command.cooldown)) {
      // Execute the command (start cooldown)
      this.rateLimiter.execute(message, command.name, command.cooldown);
      return true;
    }

    // Command is on cooldown - optionally show cooldown message
    const remainingMs = this.rateLimiter.getRemainingCooldown(
      message,
      command.name,
      command.cooldown,
    );

    if (remainingMs > 0) {
      const timeLeft = TimeUtilities.convertMs(remainingMs);
      // We could reply with cooldown message, but for custom commands
      // we'll silently ignore to avoid spam. Built-in commands show cooldown messages.
      this.botClient.logger?.debug(
        `Custom command '${command.name}' on cooldown for ${message.user.username} (${timeLeft} remaining)`,
      );
    }

    return false;
  }

  /**
   * Creates a context object for command template processing, containing user info, room info, arguments, and other relevant data.
   * @param message The message object that triggered the command
   * @param args The arguments passed to the command
   * @returns A context object for template processing
   */
  private createCommandContext(
    message: Message,
    args: string[] = [],
  ): CustomCommandContext {
    const room = this.botClient.chat.activeRooms.get(message.room_id);

    return {
      user: {
        id: message.user.id,
        username: message.user.username,
        display_name: message.user.display_name || message.user.username,
      },
      room: {
        id: message.room_id,
        title: room?.title || room?.fallback_title || "Unknown Room",
      },
      args: args,
      argsRaw: args.join(" "),
      timestamp: new Date(),
    };
  }

  /**
   * Processes template variables in command content using the provided context.
   * Supports variables like {user.username}, {room.title}, {args}, and functions like {random(min,max)} and {choose(option1,option2)}.
   * @param content The command content with template variables
   * @param context The context object containing user, room, args, and other data for variable replacement
   * @returns The processed content with all variables replaced with actual values
   */
  private processTemplate(
    content: string,
    context: CustomCommandContext,
  ): string {
    let processed = content;

    // Basic variable replacements
    processed = processed
      .replace(/\{user\.username\}/g, context.user.username)
      .replace(/\{user\.display_name\}/g, context.user.display_name)
      .replace(/\{user\.id\}/g, context.user.id.toString())
      .replace(/\{room\.title\}/g, context.room.title)
      .replace(/\{room\.id\}/g, context.room.id.toString())
      .replace(/\{args\}/g, context.args.join(" "))
      .replace(/\{argsRaw\}/g, context.argsRaw)
      .replace(/\{timestamp\}/g, context.timestamp.toLocaleString());

    // Process random number generation: {random(min,max)}
    processed = processed.replace(
      /\{random\((\d+),(\d+)\)\}/g,
      (match, min, max) => {
        const minNum = parseInt(min);
        const maxNum = parseInt(max);
        if (minNum <= maxNum) {
          return (
            Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
          ).toString();
        }
        return match; // Return original if invalid
      },
    );

    // Process random choice: {choose(option1,option2,option3)}
    processed = processed.replace(
      /\{choose\(([^)]+)\)\}/g,
      (match, options) => {
        const choices = options.split(",").map((s: string) => s.trim());
        return choices[Math.floor(Math.random() * choices.length)];
      },
    );

    // Process countdown/time functions: {time(format)}
    processed = processed.replace(/\{time\(([^)]+)\)\}/g, (match, format) => {
      const now = new Date();
      switch (format.toLowerCase()) {
        case "short":
          return now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        case "full":
          return now.toLocaleString();
        case "date":
          return now.toLocaleDateString();
        case "iso":
          return now.toISOString();
        default:
          return now.toLocaleString();
      }
    });

    // Process math operations: {math(expression)}
    processed = processed.replace(
      /\{math\(([^)]+)\)\}/g,
      (match, expression) => {
        try {
          // Basic math evaluation (safe operations only)
          const safeExpression = expression.replace(/[^0-9+\-*/.() ]/g, "");
          if (safeExpression.length !== expression.length) {
            return match; // Contains unsafe characters
          }
          const result = Function(`"use strict"; return (${safeExpression})`)();
          return isFinite(result) ? result.toString() : match;
        } catch {
          return match;
        }
      },
    );

    // Process string manipulation: {upper(text)}, {lower(text)}
    processed = processed.replace(/\{upper\(([^)]+)\)\}/g, (_match, text) => {
      return this.resolveNestedVariables(text, context).toUpperCase();
    });

    processed = processed.replace(/\{lower\(([^)]+)\)\}/g, (_match, text) => {
      return this.resolveNestedVariables(text, context).toLowerCase();
    });

    // Process length function: {length(text)}
    processed = processed.replace(/\{length\(([^)]+)\)\}/g, (_match, text) => {
      return this.resolveNestedVariables(text, context).length.toString();
    });

    // Process user mentions (if mentionUser behavior is enabled)
    processed = processed.replace(/\{mention\}/g, `@${context.user.username}`);

    return processed;
  }

  /**
   * Resolves nested variables in a string (used for functions that take text input).
   * @param text The text containing variables to resolve
   * @param context The command context to use for variable resolution
   * @returns The text with variables resolved
   */
  private resolveNestedVariables(
    text: string,
    context: CustomCommandContext,
  ): string {
    return text
      .replace(/user\.username/g, context.user.username)
      .replace(/user\.display_name/g, context.user.display_name)
      .replace(/room\.title/g, context.room.title)
      .replace(/args/g, context.args.join(" "));
  }

  /**
   * Checks if the room has reached its daily usage limit for custom commands.
   * @param roomCommands The RoomCustomCommands object containing usage stats and limits for the room
   * @returns True if the room has not reached its daily usage limit, false otherwise
   */
  private checkDailyUsage(roomCommands: RoomCustomCommands): boolean {
    const today = new Date().toISOString().split("T")[0];

    // Reset daily usage if it's a new day
    if (roomCommands.dailyUsage.date !== today) {
      roomCommands.dailyUsage = {
        date: today,
        totalUsage: 0,
        commandUsage: new Map(),
      };
    }

    return roomCommands.dailyUsage.totalUsage < roomCommands.limits.dailyUsage;
  }

  /**
   * Updates usage statistics for a command, including total usage and daily usage tracking.
   * This is called each time a command is executed to keep accurate counts for rate limiting and usage analytics.
   * @param command The command that was executed
   * @param roomId The ID of the room where the command was executed
   */
  private async updateUsageStats(
    command: CustomCommand,
    roomId: number,
  ): Promise<void> {
    command.usageCount++;
    const roomCommands = await this.getRoomCustomCommands(roomId);
    roomCommands.totalUsage++;

    // Update daily usage
    const today = new Date().toISOString().split("T")[0];
    if (roomCommands.dailyUsage.date !== today) {
      roomCommands.dailyUsage = {
        date: today,
        totalUsage: 1,
        commandUsage: new Map([[command.name, 1]]),
      };
    } else {
      roomCommands.dailyUsage.totalUsage++;
      const currentUsage =
        roomCommands.dailyUsage.commandUsage.get(command.name) || 0;
      roomCommands.dailyUsage.commandUsage.set(command.name, currentUsage + 1);
    }

    await this.saveRoomCustomCommands(roomId, roomCommands);
  }

  /**
   * Retrieves the room settings storage provider for a given room ID, loading from storage if not already cached.
   * This is used to access and modify the custom command data stored in the room's settings.
   * @param roomId The ID of the room to get settings for
   * @returns A KeyedStorageProvider for the room's settings
   */
  private async getRoomSettings(roomId: number): Promise<KeyedStorageProvider> {
    let settings = this.botClient.roomSettings.get(roomId);
    if (!settings) {
      await this.botClient.roomStorageLoader.loadRoomSettings(roomId);
      settings = this.botClient.roomSettings.get(roomId)!;
    }
    return settings;
  }

  /**
   * Saves the custom commands for a room back to storage and updates the cache.
   * @param roomId The ID of the room
   * @param roomCommands The custom commands for the room
   */
  private async saveRoomCustomCommands(
    roomId: number,
    roomCommands: RoomCustomCommands,
  ): Promise<void> {
    const settings = await this.getRoomSettings(roomId);

    // Convert Map to plain object for storage
    const storageData = {
      commands: Object.fromEntries(roomCommands.commands),
      limits: roomCommands.limits,
      totalUsage: roomCommands.totalUsage,
      dailyUsage: {
        date: roomCommands.dailyUsage.date,
        totalUsage: roomCommands.dailyUsage.totalUsage,
        commandUsage: Object.fromEntries(roomCommands.dailyUsage.commandUsage),
      },
      lastModified: roomCommands.lastModified,
      subscriptionTier: roomCommands.subscriptionTier,
    };

    settings.set("custom_commands", storageData);
    this.commandCache.set(roomId, roomCommands);
  }

  /**
   * Gets the command prefix for a room from the bot client.
   * @param roomId The ID of the room to get the prefix for
   * @returns The command prefix for the room
   */
  private async getPrefix(roomId: number): Promise<string> {
    return await this.botClient.getPrefix(roomId);
  }

  /**
   * Generates a unique command ID using a combination of timestamp and random string.
   * This ensures that each command has a unique identifier that can be used for management and storage.
   * @returns A unique command ID string
   */
  private generateCommandId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
