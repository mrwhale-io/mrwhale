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

const FRIEND_REQUEST_INTERVAL = 60 * 1000;

/**
 * Represents the main client for interacting with the Game Jolt API and grid system.
 * The `Client` class provides access to various managers, such as `APIManager` and `GridManager`,
 * and facilitates communication with the Game Jolt platform through events and API requests.
 *
 * @example
 * ```typescript
 * const client = new Client({
 *  userId: 12345,
 *  frontend: config.frontend,
 *  mrwhaleToken: config.mrwhaleToken,
 * });
 * 
 * client.chat.joinRoom(12345);
 * 
 * client.on("message", (message: Message) => {
 *  if (message.textContent === "ping") {
 *    message.reply("pong");
 *  }
 * });
 * ```
 */
export class Client extends events.EventEmitter {
  /**
   * The api manager for interacting with the site api.
   */
  readonly api: APIManager;

  /**
   * The grid manager.
   */
  readonly grid: GridManager;

  /**
   * The identifier of the client user.
   */
  readonly userId: number;

  /**
   * The max number of requests that can be made
   * before rate limiting.
   */
  readonly rateLimitRequests: number;

  /**
   * The max duration of rate limiting.
   */
  readonly rateLimitDuration: number;

  /**
   * Gets the ChatManager instance associated with the current grid.
   */
  get chat(): ChatManager {
    return this.grid.chat;
  }

  /**
   * Contains all users that are blocked by the client user.
   */
  get blockedUsers(): Block[] {
    return this.api.blocks.blockedUsers;
  }

  /**
   * The logger instance.
   */
  readonly logger: Logger;

  /**
   * @param options The client options.
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

  on(event: "message", listener: (data: Message) => void): this;
  on(event: "notification", listener: (data: Message) => void): this;
  on(
    event: "user_updated",
    listener: (data: { room_id: number; user: User }) => void
  ): this;
  on(event: "friend_updated", listener: (data: number) => void): this;
  on(event: "friend_add", listener: (data: User) => void): this;
  on(event: "friend_remove", listener: (data: number) => void): this;
  on(event: "you_updated", listener: (data: User) => void): this;
  on(
    event: "member_add",
    listener: (data: { room_id: number; members: User[] }) => void
  ): this;
  on(
    event: "member_leave",
    listener: (data: { room_id: number; member: User }) => void
  ): this;
  on(
    event: "owner_sync",
    listener: (data: { room_id: number; owner_id: number }) => void
  ): this;
  on(event: "user_notification", listener: (data: Notification) => void): this;
  on(event: string, listener: (...args: never[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Send a request to the site api to fetch the client user's friend requests.
   * Emits a `friend_requests` event with the friend requests.
   */
  private async fetchFriendRequests(): Promise<void> {
    const requests = await this.api.friends.getFriendRequests();
    if (requests) {
      this.emit(Events.FRIEND_REQUESTS, requests);
    }
  }

  /**
   * Initialise timers to send fetch requests.
   * This keeps the notification/friend requests and counts
   * up to date.
   */
  private initTimers(): void {
    setInterval(() => this.fetchFriendRequests(), FRIEND_REQUEST_INTERVAL);
  }
}
