import * as events from "events";

import { ChatManager } from "./chat/chat-manager";
import { Message } from "../structures/message";
import { ClientOptions } from "../types/client-options";
import { APIManager } from "./api/api-manager";
import { User } from "../structures/user";
import { GridManager } from "./grid/grid-manager";
import { Notification } from "../structures/notification";
import { Block } from "../structures/block";
import { Events } from "../constants";
import { Logger } from "../types/logger";
import { defaultLogger } from "../util/default-logger";
import { Room } from "../structures/room";
import { FriendRequest } from "../structures/friend-request";
import { UserChannelResponse } from "../types/user-channel-response";
import {
  UserUpdatedEventData,
  MemberAddEventData,
  MemberLeaveEventData,
  OwnerSyncEventData,
  ClientEventName
} from "../types/events";

/** Interval (in milliseconds) for fetching friend request updates from the API. */
const FRIEND_REQUEST_INTERVAL = 60 * 1000;

/**
 * Main Game Jolt Client - Core interface for Game Jolt platform integration.
 *
 * The `Client` class serves as the primary entry point for all interactions with the Game Jolt platform.
 * It provides a unified interface to the chat system, site API, user management, and real-time communication
 * features through specialized manager instances.
 *
 * @example
 * ```typescript
 * // Basic client initialization
 * const client = new Client({
 *   userId: 123456,
 *   frontend: 'your-frontend-id',
 *   mrwhaleToken: 'mrwhale-token'
 * });
 *
 * // Set up event listeners
 * client.on('message', (message: Message) => {
 *   console.log(`${message.user.username}: ${message.textContent}`);
 *
 *   if (message.textContent === 'ping') {
 *     message.reply('pong!');
 *   }
 * });
 *
 * client.on('friend_add', (user: User) => {
 *   console.log(`New friend added: ${user.username}`);
 * });
 *
 * client.on('notification', (message: Message) => {
 *   console.log('Received notification:', message.textContent);
 * });
 *
 * // Join specific chat rooms
 * await client.chat.joinRoom(12345);
 * await client.chat.sendMessage('Hello everyone!', 12345);
 *
 * // Access API endpoints
 * const user = await client.api.users.getUser(67890);
 * const friendRequests = await client.api.friends.getFriendRequests();
 * ```
 */
export class Client extends events.EventEmitter {
  /**
   * The API manager for interacting with Game Jolt's site API.
   * Provides access to REST endpoints for users, games, friends, notifications,
   * and other Game Jolt platform features.
   *
   * @readonly
   */
  readonly api: APIManager;

  /**
   * The Grid manager for WebSocket connections and real-time communication.
   * Handles the underlying WebSocket connection, channel management,
   * and real-time event processing.
   *
   * @readonly
   */
  readonly grid: GridManager;

  /**
   * The unique identifier of the authenticated client user.
   * This ID is used for API requests, chat operations, and event filtering.
   *
   * @readonly
   */
  readonly userId: number;

  /**
   * Maximum number of API requests that can be made before rate limiting kicks in.
   * Used by various managers to prevent exceeding Game Jolt's rate limits.
   *
   * @default 1
   * @readonly
   */
  readonly rateLimitRequests: number;

  /**
   * Maximum duration (in milliseconds) for rate limiting windows.
   * Defines the time window for the rate limit request count.
   *
   * @default 1
   * @readonly
   */
  readonly rateLimitDuration: number;

  /**
   * Gets the ChatManager instance for real-time chat operations.
   * Provides access to chat functionality including room management,
   * message sending, friend lists, and chat events.
   *
   * @returns The ChatManager instance associated with this client.
   */
  get chat(): ChatManager {
    return this.grid.chat;
  }

  /**
   * Gets all users currently blocked by the authenticated client user.
   * Returns an array of Block objects containing user information and block details.
   *
   * @returns Array of Block objects representing blocked users.
   */
  get blockedUsers(): Block[] {
    return this.api.blocks.blockedUsers;
  }

  /**
   * The logger instance used for debugging, error reporting, and monitoring.
   * Provides structured logging with different severity levels (info, warn, error).
   *
   * @readonly
   */
  readonly logger: Logger;

  /**
   * Creates a new Game Jolt client instance.
   *
   * Initializes the client with the provided options, sets up API and Grid managers,
   * configures rate limiting, and starts background timers for periodic updates.
   *
   * @param options - Configuration options for the client.
   * @param options.userId - The unique ID of the user to authenticate as.
   * @param options.frontend - The frontend identifier for API requests.
   * @param options.mrwhaleToken - Authentication token for API access.
   * @param options.baseApiUrl - Optional base URL for the site API (defaults to Game Jolt's API).
   * @param options.baseGridUrl - Optional base URL for the Grid WebSocket service.
   * @param options.logger - Optional custom logger instance (defaults to console logger).
   * @param options.rateLimitRequests - Optional max requests before rate limiting (defaults to 1).
   * @param options.rateLimitDuration - Optional rate limit duration in ms (defaults to 1).
   *
   * @example
   * ```typescript
   * const client = new Client({
   *   userId: 123456,
   *   frontend: 'frontend-id-here',
   *   mrwhaleToken: 'mrwhale-token-here',
   *   rateLimitRequests: 5,
   *   rateLimitDuration: 1000,
   *   logger: customLogger
   * });
   * ```
   */
  constructor(options: ClientOptions) {
    super();
    this.userId = options.userId;
    this.logger = options.logger || defaultLogger;
    this.grid = new GridManager(this, {
      frontend: options.frontend,
      baseUrl: options.baseGridUrl,
      mrwhaleToken: options.mrwhaleToken,
    });
    this.api = new APIManager(this, {
      frontend: options.frontend,
      base: options.baseApiUrl,
      mrwhaleToken: options.mrwhaleToken,
    });
    this.rateLimitRequests = options.rateLimitRequests || 1;
    this.rateLimitDuration = options.rateLimitDuration || 1;
    this.initTimers();
  }

  /**
   * Fired when a chat message is received in any joined room.
   * @param event - The 'message' event name.
   * @param listener - Callback function that receives the Message object.
   */
  on(event: "message", listener: (message: Message) => void): this;

  /**
   * Fired when a notification message is received (room invites, mentions, etc.).
   * @param event - The 'notification' event name.
   * @param listener - Callback function that receives the notification Message object.
   */
  on(event: "notification", listener: (notification: Message) => void): this;

  /**
   * Fired when a user's information is updated in a specific room.
   * @param event - The 'user_updated' event name.
   * @param listener - Callback function that receives user update data.
   */
  on(
    event: "user_updated",
    listener: (data: UserUpdatedEventData) => void,
  ): this;

  /**
   * Fired when a friend's information is updated.
   * @param event - The 'friend_updated' event name.
   * @param listener - Callback function that receives the friend's user ID.
   */
  on(event: "friend_updated", listener: (friendUserId: number) => void): this;

  /**
   * Fired when a new friend is added to the client user's friend list.
   * @param event - The 'friend_add' event name.
   * @param listener - Callback function that receives the new friend User object.
   */
  on(event: "friend_add", listener: (friend: User) => void): this;

  /**
   * Fired when a friend is removed from the client user's friend list.
   * @param event - The 'friend_remove' event name.
   * @param listener - Callback function that receives the removed friend's user ID.
   */
  on(
    event: "friend_remove",
    listener: (removedFriendUserId: number) => void,
  ): this;

  /**
   * Fired when the client user's own information is updated.
   * @param event - The 'you_updated' event name.
   * @param listener - Callback function that receives the updated User object.
   */
  on(event: "you_updated", listener: (updatedUser: User) => void): this;

  /**
   * Fired when new members join a group room.
   * @param event - The 'member_add' event name.
   * @param listener - Callback function that receives member addition data.
   */
  on(event: "member_add", listener: (data: MemberAddEventData) => void): this;

  /**
   * Fired when a member leaves a group room.
   * @param event - The 'member_leave' event name.
   * @param listener - Callback function that receives member leave data.
   */
  on(
    event: "member_leave",
    listener: (data: MemberLeaveEventData) => void,
  ): this;

  /**
   * Fired when a group room's owner changes.
   * @param event - The 'owner_sync' event name.
   * @param listener - Callback function that receives owner change data.
   */
  on(event: "owner_sync", listener: (data: OwnerSyncEventData) => void): this;

  /**
   * Fired when a user notification is received from the Game Jolt platform.
   * @param event - The 'user_notification' event name.
   * @param listener - Callback function that receives the Notification object.
   */
  on(
    event: "user_notification",
    listener: (notification: Notification) => void,
  ): this;

  /**
   * Fired when the chat system is ready and user channel has been joined.
   * @param event - The 'chat_ready' event name.
   * @param listener - Callback function that receives the user channel response data.
   */
  on(
    event: "chat_ready",
    listener: (response: UserChannelResponse) => void,
  ): this;

  /**
   * Fired when a room has been successfully joined and is ready for interaction.
   * @param event - The 'room_ready' event name.
   * @param listener - Callback function that receives the room join response data.
   */
  on(
    event: "room_ready",
    listener: (response: { room: Partial<Room> }) => void,
  ): this;

  /**
   * Fired when a new group chat is added to the user's group list.
   * @param event - The 'group_add' event name.
   * @param listener - Callback function that receives the new group Room object.
   */
  on(event: "group_add", listener: (group: Room) => void): this;

  /**
   * Fired when the user leaves a group chat.
   * @param event - The 'group_leave' event name.
   * @param listener - Callback function that receives the left group's room ID.
   */
  on(event: "group_leave", listener: (roomId: number) => void): this;

  /**
   * Fired when friend requests are fetched from the API.
   * @param event - The 'friend_requests' event name.
   * @param listener - Callback function that receives the array of FriendRequest objects.
   */
  on(
    event: "friend_requests",
    listener: (requests: FriendRequest[]) => void,
  ): this;

  /**
   * Fallback for any other event types not explicitly defined above.
   * @param event - The event name as a string.
   * @param listener - Callback function that receives variable arguments.
   */
  on(
    event: Exclude<string, ClientEventName>,
    listener: (...args: any[]) => void,
  ): this;

  /** Base implementation for all event listener overloads. */
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Fetches the client user's pending friend requests from the Game Jolt API.
   *
   * Makes an API request to retrieve all pending friend requests for the authenticated user.
   * If friend requests are found, emits a `friend_requests` event with the request data.
   * This method is called periodically to keep the friend request list up to date.
   *
   * @private
   * @returns A Promise that resolves when the friend request fetch is complete.
   * @fires Client#friend_requests - When friend requests are successfully retrieved.
   */
  private async fetchFriendRequests(): Promise<void> {
    const requests = await this.api.friends.getFriendRequests();
    if (requests) {
      this.emit(Events.FRIEND_REQUESTS, requests);
    }
  }

  /**
   * Initializes periodic timers for automatic data fetching.
   *
   * Sets up background timers that periodically fetch updated data from the Game Jolt API
   * to keep the client state synchronized with the server. Currently handles:
   * - Friend request updates (every 60 seconds)
   *
   * This ensures that the client receives updates for data that doesn't come through
   * real-time WebSocket events.
   *
   * @private
   */
  private initTimers(): void {
    setInterval(() => this.fetchFriendRequests(), FRIEND_REQUEST_INTERVAL);
  }
}
