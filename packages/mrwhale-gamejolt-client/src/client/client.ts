import * as events from "events";

import { ChatManager } from "./chat/chat-manager";
import { Message } from "../structures/message";
import { ClientOptions } from "../types/client-options";
import { APIManager } from "./api/api-manager";
import { User } from "../structures/user";
import { GridManager } from "./grid/grid-manager";
import { Notification } from "../structures/notification";
import { Block } from "../structures/block";

const FRIEND_REQUEST_INTERVAL = 60;

/**
 * The main client for interacting with the chat and site api.
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
   * Contains all blocked users.
   */
  blockedUsers: Block[];

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
   * Get the chat client.
   */
  get chat(): ChatManager {
    return this.grid.chat;
  }

  /**
   * @param options The client options.
   */
  constructor(options: ClientOptions) {
    super();
    this.userId = options.userId;
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
    this.getBlockedUsers();
    this.rateLimitRequests = options.rateLimitRequests || 1;
    this.rateLimitDuration = options.rateLimitDuration || 1;
    this.initTimers();
  }

  /**
   * Send a request to the site api to fetch the client user's friend requests.
   */
  async fetchFriendRequests(): Promise<void> {
    const requests = await this.api.friends.getFriendRequests();
    if (requests) {
      this.emit("friend_requests", requests);
    }
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

  private async getBlockedUsers(): Promise<void> {
    this.blockedUsers = await this.api.blocks.getBlockedUsers();
  }

  /**
   * Initialise timers to send fetch requests.
   * This keeps the notification/friend requests and counts
   * up to date. This Should only be used internally.
   */
  private initTimers(): void {
    setInterval(() => {
      this.fetchFriendRequests();
    }, FRIEND_REQUEST_INTERVAL * 1000);
  }
}
