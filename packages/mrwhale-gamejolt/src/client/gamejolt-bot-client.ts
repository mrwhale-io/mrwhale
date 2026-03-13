import {
  ListenerDecorators,
  BotClient,
  code,
  KeyedStorageProvider,
} from "@mrwhale-io/core";
import {
  ClientOptions,
  Message,
  User,
  Content,
  Room,
  Client,
  UserCollection,
  Events,
  MemberAddEventData,
  MemberLeaveEventData,
  OwnerSyncEventData,
  KickMemberEventData,
} from "@mrwhale-io/gamejolt-client";
import { GameJolt } from "joltite.js";

import { GameJoltBotOptions } from "../types/bot-options";
import { FriendRequestManager } from "./managers/friend-request-manager";
import { ReplyManager } from "./managers/reply-manager";
import { CleverbotManager } from "./managers/cleverbot-manager";
import { UrlManager } from "./managers/url-manager";
import { LevelManager } from "./managers/level-manager";
import { Policer } from "./managers/policer";
import { GameJoltCommandDispatcher } from "./command/gamejolt-command-dispatcher";
import { GameJoltCommand } from "./command/gamejolt-command";
import { RoomStorageLoader } from "./storage/room-storage-loader";
import { MAX_PREFIX_LENGTH } from "../constants";

const { on, once, registerListeners } = ListenerDecorators;

/**
 * Game Jolt Bot Client - A bot framework for Game Jolt's chat system.
 *
 * This class extends the base BotClient and provides a complete implementation for
 * interacting with Game Jolt's chat platform. It handles friend management, group
 * chat operations, command processing, and various automated responses.
 */
export class GameJoltBotClient extends BotClient<GameJoltCommand> {
  /**
   * The Game Jolt API client for accessing game-related data and functionality.
   * Provides access to game statistics, trophies, data storage, and other Game Jolt features.
   *
   * @readonly
   */
  readonly gameApi: GameJolt;

  /**
   * Room-specific settings storage manager.
   * Maps room IDs to their individual KeyedStorageProvider instances,
   * allowing per-room configuration like custom prefixes, permissions, and features.
   *
   * @readonly
   */
  readonly roomSettings: Map<number, KeyedStorageProvider>;

  /**
   * The underlying Game Jolt client instance.
   * Provides low-level access to the Game Jolt chat system, user management,
   * and real-time communication features.
   *
   * @readonly
   */
  readonly client: Client;

  /**
   * Gets the Game Jolt chat client instance.
   * Provides access to chat operations like sending messages, joining rooms,
   * managing friends, and handling real-time chat events.
   *
   * @returns The ChatManager instance for this client.
   */
  get chat() {
    return this.client.chat;
  }

  /**
   * Gets the client's friends list.
   * Contains all users who have friended the bot, allowing for friend-specific
   * commands and private message handling.
   *
   * @returns A UserCollection containing all current friends.
   */
  get friendsList(): UserCollection {
    return this.chat.friendsList;
  }

  /**
   * Gets the chat client's uptime in milliseconds.
   * Calculated from when the chat system was initialized and became ready.
   *
   * @returns The uptime in milliseconds since chat initialization.
   */
  get uptime(): number {
    return Date.now() - this.chat.startTime;
  }

  /**
   * Gets the current Cleverbot integration status.
   * When enabled, the bot will use Cleverbot AI for conversational responses
   * in addition to command processing.
   *
   * @returns `true` if Cleverbot is enabled and available, `false` otherwise.
   */
  get cleverbot(): boolean {
    return this.cleverbotManager?.isEnabled ?? false;
  }

  /**
   * Sets the Cleverbot integration on/off status.
   * Controls whether the bot will use AI-powered responses for non-command messages.
   *
   * @param value - `true` to enable Cleverbot integration, `false` to disable.
   */
  set cleverbot(value: boolean) {
    this.cleverbotManager.isEnabled = value;
  }

  /**
   * Collection of active timeout handles for cleanup management.
   * Tracks all setTimeout calls to ensure proper cleanup on bot shutdown.
   */
  private timeouts: Set<
    NodeJS.Timer | NodeJS.Timeout | string | number | undefined
  >;

  /**
   * Collection of active interval handles for cleanup management.
   * Tracks all setInterval calls to ensure proper cleanup on bot shutdown.
   */
  private intervals: Set<NodeJS.Timeout | string | number | undefined>;

  /**
   * Command dispatcher responsible for parsing and executing bot commands.
   * Handles command registration, argument parsing, permission checking, and execution flow.
   */
  private readonly commandDispatcher: GameJoltCommandDispatcher;

  /**
   * Manages incoming friend requests and friend-related operations.
   * Handles automatic friend acceptance, friend list management, and friend-specific features.
   */
  private readonly friendRequestManager: FriendRequestManager;

  /**
   * Handles automated message replies and response generation.
   * Manages context-aware responses, reply templates, and conversation flow.
   */
  readonly replyManager: ReplyManager;

  /**
   * Optional Cleverbot integration manager for AI-powered conversations.
   * Provides natural language processing and contextual responses when enabled.
   */
  readonly cleverbotManager?: CleverbotManager;

  /**
   * Manages URL detection, validation, and filtering in messages.
   * Handles link preview generation, security checks, and content filtering.
   */
  readonly urlManager: UrlManager;

  /**
   * Manages user experience points, levels, and progression systems.
   * Tracks user activity, calculates experience gains, and handles level-up rewards.
   */
  readonly levelManager: LevelManager;

  /**
   * Content moderation and policy enforcement manager.
   * Handles spam detection, content filtering, and automated moderation actions.
   */
  readonly policer: Policer;

  /**
   * Manages persistent storage for room-specific settings and data.
   * Handles loading, saving, and caching of per-room configuration.
   */
  readonly roomStorageLoader: RoomStorageLoader;

  /**
   * Creates a new Game Jolt bot client instance.
   *
   * Initializes all required managers, validates configuration, and sets up
   * the connection to Game Jolt's chat system. The constructor performs
   * comprehensive validation and will throw descriptive errors for invalid configurations.
   *
   * @param clientOptions - Game Jolt client connection configuration including user credentials and connection settings.
   * @param botOptions - Bot-specific configuration including game API access, features, and behavior settings.
   * @throws {Error} If required options are missing, invalid, or if initialization fails.
   *
   * @example
   * ```typescript
   * const clientOptions: ClientOptions = {
   *   userId: 123456,
   *   frontend: 'your-frontend-id',
   *   token: 'your-gamejolt-token'
   * };
   *
   * const botOptions: GameJoltBotOptions = {
   *   name: 'MrWhale',
   *   defaultPrefix: '!',
   *   gameId: 'your-game-id',
   *   privateKey: 'your-private-key',
   *   cleverbotToken: 'optional-cleverbot-token' // Optional
   * };
   *
   * const bot = new GameJoltBotClient(clientOptions, botOptions);
   * ```
   */
  constructor(clientOptions: ClientOptions, botOptions: GameJoltBotOptions) {
    super(botOptions);

    // Validate required options
    this.validateOptions(clientOptions, botOptions);

    try {
      this.client = new Client(clientOptions);
      this.commandDispatcher = new GameJoltCommandDispatcher(this);
      this.timeouts = new Set();
      this.intervals = new Set();
      this.roomSettings = new Map<number, KeyedStorageProvider>();

      this.commandLoader.commandType = GameJoltCommand.name;
      this.commandLoader.loadCommands();

      // Initialize managers with error handling
      this.friendRequestManager = new FriendRequestManager(this);
      this.replyManager = new ReplyManager(this);
      this.urlManager = new UrlManager(this);
      this.levelManager = new LevelManager(this);
      this.roomStorageLoader = new RoomStorageLoader(this);
      this.policer = new Policer(this);

      this.gameApi = new GameJolt({
        privateKey: botOptions.privateKey,
        gameId: botOptions.gameId,
      });

      if (botOptions.cleverbotToken) {
        this.cleverbotManager = new CleverbotManager(
          this,
          botOptions.cleverbotToken,
        );
      }

      this.roomStorageLoader.init();
      registerListeners(this.client, this);

      this.logger.info("Game Jolt bot client initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Game Jolt bot client:", error);
      throw new Error(`Bot initialization failed: ${error.message}`);
    }
  }

  @once(Events.CHAT_READY)
  protected async onChatReady(): Promise<void> {
    try {
      this.commandDispatcher.ready = true;
      this.client.emit("client_ready");
      this.logger.info("Chat is ready, command dispatcher enabled");
    } catch (error) {
      this.logger.error("Error in chat ready handler:", error);
    }
  }

  @once("client_ready")
  protected async onClientReady(): Promise<void> {
    try {
      this.startTime = Date.now();

      if (!this.chat.currentUser) {
        this.logger.error("Current user is not available after client ready");
        return;
      }

      this.logger.info(
        `Client ready! Connected as @${this.chat.currentUser.username} (ID: ${this.client.userId})`,
      );
    } catch (error) {
      this.logger.error("Error in client ready handler:", error);
    }
  }

  @on(Events.NOTIFICATION)
  protected async onNotification(message: Message): Promise<void> {
    try {
      // Join the room channel if not already joined.
      if (message && !this.chat.isInRoom(message.room_id)) {
        await this.joinRoom(message.room_id);

        // Re-emit as a message event now that we're in the room channel and can receive messages.
        this.client.emit(Events.MESSAGE, message);
      }

      // Accept chat invite if this is an invite message.
      if (message && message.isInvite) {
        try {
          await message.acceptInvite();
        } catch (inviteError) {
          this.logger.error(
            `Failed to accept invite: ${inviteError.message}`,
            inviteError,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error handling notification: ${error.message}`, error);
    }
  }

  @on(Events.FRIEND_ADD)
  protected async onFriendAdd(friend: User): Promise<void> {
    if (friend) {
      const prefix = await this.getPrefix(friend.room_id);
      this.logger.info(
        `User @${friend.username} (${friend.id}) added as friend`,
      );

      await this.joinRoom(friend.room_id);

      const message = `Thank you for adding me as a friend! Use ${code(
        `${prefix}help`,
      )} for a list of commands.`;

      this.chat.sendMessage(message, friend.room_id);
    }
  }

  @on(Events.GROUP_ADD)
  protected async onGroupAdd(group: Room): Promise<void> {
    if (group) {
      const prefix = await this.getPrefix(group.id);

      await this.joinRoom(group.id);

      const message = `Thank you for adding me to your group! Use ${code(
        `${prefix}help`,
      )} for a list of commands.`;

      this.chat.sendMessage(message, group.id);
      this.logger.info(`Added to a group chat with id: ${group.id}`);
    }
  }

  @on(Events.MEMBER_ADD)
  protected onMemberAdd(data: MemberAddEventData): void {
    try {
      if (
        !data?.room_id ||
        !Array.isArray(data.members) ||
        data.members.length === 0
      ) {
        this.logger.warn(`Invalid ${Events.MEMBER_ADD} data received:`, data);
        return;
      }

      // Only send messages in rooms we're actually in
      if (!this.chat.isInRoom(data.room_id)) {
        return;
      }

      const room = this.chat.activeRooms.get(data.room_id);
      if (!room || !room.isGroupRoom) {
        return;
      }

      // Filter out the bot itself from the welcome message
      const newMembers = data.members.filter(
        (member) => member.id !== this.client.userId,
      );

      if (newMembers.length === 0) {
        return; // Only the bot was added, no need for a message
      }

      const memberNames = newMembers.map((member) => `@${member.username}`);
      const verb = newMembers.length === 1 ? "was" : "were";
      const noun = newMembers.length === 1 ? "member" : "members";

      const content = new Content().insertText(
        `👋 ${memberNames.join(", ")} ${verb} added to the group. Welcome!`,
      );

      this.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `${newMembers.length} new ${noun} added to group chat ${
          data.room_id
        }: ${memberNames.join(", ")}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling member_add event: ${error.message}`,
        error,
      );
    }
  }

  @on(Events.MEMBER_LEAVE)
  protected onMemberLeave(data: MemberLeaveEventData): void {
    try {
      if (!data?.room_id || !data?.member) {
        this.logger.warn(`Invalid ${Events.MEMBER_LEAVE} data received:`, data);
        return;
      }

      // Only send messages in rooms we're actually in
      if (!this.chat.isInRoom(data.room_id)) {
        return;
      }

      const room = this.chat.activeRooms.get(data.room_id);
      if (!room || !room.isGroupRoom) {
        return;
      }

      // Don't announce when the bot itself leaves
      if (data.member.id === this.client.userId) {
        return;
      }

      const content = new Content().insertText(
        `👋 @${data.member.username} has left the group.`,
      );

      this.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `User ${data.member.username} (${data.member.id}) left group chat ${data.room_id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling ${Events.MEMBER_LEAVE} event: ${error.message}`,
        error,
      );
    }
  }

  @on(Events.OWNER_SYNC)
  protected onOwnerSync(data: OwnerSyncEventData): void {
    try {
      if (!data?.room_id || !data?.owner_id) {
        this.logger.warn(`Invalid ${Events.OWNER_SYNC} data received:`, data);
        return;
      }

      // Only send messages in rooms we're actually in
      if (!this.chat.isInRoom(data.room_id)) {
        return;
      }

      const room = this.chat.activeRooms.get(data.room_id);
      if (!room || !room.isGroupRoom) {
        return;
      }

      // Don't announce if the bot becomes owner (less spam)
      if (data.owner_id === this.client.userId) {
        this.logger.info(`Bot became owner of group chat ${data.room_id}`);
        return;
      }

      // Try to get the owner from room members, fallback to user ID if not found
      const owner = room.owner;
      let ownerName: string;

      if (owner) {
        ownerName = `@${owner.username}`;
      } else {
        // Owner might not be in the members list yet, use the ID
        ownerName = `User ${data.owner_id}`;
        this.logger.warn(
          `Owner with ID ${data.owner_id} not found in room ${data.room_id} members list`,
        );
      }

      const content = new Content().insertText(
        `👑 ${ownerName} is now the group owner.`,
      );

      this.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `New owner ${ownerName} (${data.owner_id}) for group chat ${data.room_id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling ${Events.OWNER_SYNC} event: ${error.message}`,
        error,
      );
    }
  }

  @on(Events.KICK_MEMBER)
  protected onKickMember(data: KickMemberEventData): void {
    try {
      if (!data?.room_id || !data?.member) {
        this.logger.warn(`Invalid kick_member data received:`, data);
        return;
      }

      // Only send messages in rooms we're actually in
      if (!this.chat.isInRoom(data.room_id)) {
        return;
      }
      const room = this.chat.activeRooms.get(data.room_id);
      if (!room || !room.isGroupRoom) {
        return;
      }

      // Don't announce if the bot itself was kicked (it won't receive this event anyway)
      if (data.member.id === this.client.userId) {
        return;
      }

      const content = new Content().insertText(
        `👋 @${data.member.username} was kicked from the group.`,
      );
      this.chat.sendMessage(content, data.room_id);
      this.logger.info(
        `User ${data.member.username} (${data.member.id}) was kicked from group chat ${data.room_id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling ${Events.KICK_MEMBER} event: ${error.message}`,
        error,
      );
    }
  }

  /**
   * Retrieves the command prefix for a specific room.
   *
   * Each room can have its own custom prefix for bot commands. If no custom
   * prefix is set for the room, the default bot prefix is returned.
   *
   * @param roomId - The unique identifier of the room to get the prefix for.
   * @returns A Promise that resolves to the command prefix string for the specified room.
   *
   * @example
   * ```typescript
   * const prefix = await bot.getPrefix(12345);
   * console.log(`Commands in this room use: ${prefix}`);
   * // Example output: "Commands in this room use: !"
   * ```
   */
  async getPrefix(roomId: number): Promise<string> {
    const settings = this.roomSettings.get(roomId);

    if (!settings) {
      return this.defaultPrefix;
    }

    try {
      return settings.get<string>("prefix", this.defaultPrefix);
    } catch (error) {
      this.logger?.warn(`Failed to get prefix for room ${roomId}:`, error);
      return this.defaultPrefix;
    }
  }

  /**
   * Sets the command prefix for a specific room.
   *
   * Each room can have its own custom prefix for bot commands. If no custom
   * prefix is set for the room, the default bot prefix is used.
   *
   * @param roomId - The unique identifier of the room to set the prefix for.
   * @param prefix - The command prefix to set for the room.
   * @throws {Error} If the prefix is empty or exceeds the maximum length.
   */
  async setPrefix(roomId: number, prefix: string): Promise<void> {
    if (!prefix) {
      throw new Error("Prefix cannot be empty.");
    }

    if (prefix.length > MAX_PREFIX_LENGTH) {
      throw new Error(
        `Prefix cannot be longer than ${MAX_PREFIX_LENGTH} characters.`,
      );
    }

    try {
      const settings = this.roomSettings.get(roomId);
      if (!settings) {
        await this.roomStorageLoader.loadRoomSettings(roomId);
      }
      settings.set("prefix", prefix);
    } catch (error) {
      this.logger?.error(`Failed to set prefix for room ${roomId}:`, error);
      throw new Error("Could not set prefix for this room.");
    }
  }

  /**
   * Creates a managed timeout that will be automatically cleaned up on bot shutdown.
   *
   * This method wraps the standard setTimeout function and tracks the timeout
   * for proper cleanup when the bot is destroyed.
   *
   * @param callback - The function to execute after the timeout.
   * @param ms - The delay in milliseconds before executing the callback.
   * @param args - Additional arguments to pass to the callback function.
   * @returns The timeout identifier for potential early cancellation.
   */
  setTimeout(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      callback(...args);
      this.timeouts.delete(timeout);
    }, ms);
    this.timeouts.add(timeout);

    return timeout;
  }

  /**
   * Clears a managed timeout and removes it from tracking.
   *
   * @param timeout - The timeout identifier to clear.
   */
  clearTimeout(timeout: number): void {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  /**
   * Creates a managed interval that will be automatically cleaned up on bot shutdown.
   *
   * This method wraps the standard setInterval function and tracks the interval
   * for proper cleanup when the bot is destroyed.
   *
   * @param callback - The function to execute at each interval.
   * @param ms - The delay in milliseconds between each execution.
   * @param args - Additional arguments to pass to the callback function.
   * @returns The interval identifier for potential cancellation.
   */
  setInterval(
    callback: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const interval = setInterval(callback, ms, ...args);
    this.intervals.add(interval);

    return interval;
  }

  /**
   * Clears a managed interval and removes it from tracking.
   *
   * @param interval - The interval identifier to clear.
   */

  clearInterval(interval: NodeJS.Timeout | string | number | undefined): void {
    clearInterval(interval as number);
    this.intervals.delete(interval);
  }

  /**
   * Gracefully destroys the bot client and cleans up all resources.
   *
   * This method should be called when shutting down the bot to ensure proper
   * cleanup of connections, timers, and other resources. It prevents memory
   * leaks and ensures a clean shutdown process.
   *
   * @returns A Promise that resolves when all cleanup operations are complete.
   * @throws {Error} If critical cleanup operations fail.
   *
   * @example
   * ```typescript
   * // Graceful shutdown handler
   * process.on('SIGINT', async () => {
   *   console.log('Shutting down bot...');
   *   await bot.destroy();
   *   process.exit(0);
   * });
   * ```
   */
  async destroy(): Promise<void> {
    try {
      this.logger.info("Starting bot shutdown...");

      // Clear all timeouts and intervals
      for (const timeout of this.timeouts) {
        if (timeout) clearTimeout(timeout as NodeJS.Timeout);
      }
      this.timeouts.clear();

      for (const interval of this.intervals) {
        if (interval) clearInterval(interval as NodeJS.Timeout);
      }
      this.intervals.clear();

      // Disconnect from chat
      if (this.chat?.connected) {
        this.chat.destroy();
      }

      this.logger.info("Bot shutdown completed successfully");
    } catch (error) {
      this.logger.error("Error during bot shutdown:", error);
      throw error;
    }
  }

  /**
   * Safely joins a chat room with error handling.
   *
   * Attempts to join the specified room and logs any errors that occur.
   * This is a private utility method used by various event handlers.
   *
   * @param roomId - The unique identifier of the room to join.
   * @private
   */
  private async joinRoom(roomId: number) {
    try {
      await this.chat.joinRoom(roomId);
      await this.roomStorageLoader.loadRoomSettings(roomId);
    } catch (e) {
      this.logger.error(`Error joining room ${roomId}: ${e.message}`);
    }
  }

  /**
   * Validates constructor options for completeness and correctness.
   *
   * Performs validation of both client and bot options to ensure
   * all required fields are present and properly formatted. This helps catch
   * configuration errors early in the initialization process.
   *
   * @param clientOptions - The Game Jolt client connection options to validate.
   * @param botOptions - The bot configuration options to validate.
   * @throws {Error} With descriptive message indicating which required option is missing or invalid.
   * @private
   */
  private validateOptions(
    clientOptions: ClientOptions,
    botOptions: GameJoltBotOptions,
  ): void {
    if (!clientOptions) {
      throw new Error("Client options are required");
    }

    if (!botOptions) {
      throw new Error("Bot options are required");
    }

    if (!botOptions.privateKey) {
      throw new Error("Game API private key is required");
    }

    if (!botOptions.gameId) {
      throw new Error("Game ID is required");
    }
  }
}
