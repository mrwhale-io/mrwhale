import * as events from "events";
import * as fs from "fs";
import { Push } from "phoenix-channels";

import { Client } from "../client";
import { User } from "../../structures/user";
import { UserCollection } from "../../collections/user-collection";
import { RateLimiter } from "./rate-limiter";

import { ContentDocument } from "../../content/content-document";
import { Room } from "../../structures/room";
import { RoomChannel } from "./channels/room-channel";
import { Events } from "../../constants";
import { UserChannel } from "./channels/user-channel";
import { MediaItem } from "../../structures/media-item";
import { Content } from "../../content/content";
import { Message } from "../../structures/message";
import { GridManager } from "../grid/grid-manager";
import { RoomCollection } from "../../collections/room-collection";
import { KeyedCollection } from "src/util/keyed-collection";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Manages chat functionalities for the Game Jolt client.
 *
 * The `ChatManager` class extends `events.EventEmitter` and provides methods to handle chat operations such as joining and leaving rooms, sending and editing messages, uploading files, and managing user channels.
 *
 * @remarks
 * This class is responsible for maintaining the state of the chat client, including the current user, friends list, active rooms, and room channels. It also handles rate limiting for sending messages and provides methods to reset and destroy the chat manager instance.
 */
export class ChatManager extends events.EventEmitter {
  /**
   * The URL of the chat server.
   * This is a read-only property.
   */
  readonly chatUrl: string;

  /**
   * The Game Jolt client.
   * This is a read-only property.
   */
  readonly client: Client;

  /**
   * The Grid Manager instance.
   * This is a read-only property.
   */
  readonly grid: GridManager;

  /**
   * Gets the start time of the chat client.
   */
  get startTime(): number {
    return this._startTime;
  }

  /**
   * Gets the list of friends for the current user.
   */
  get friendsList(): UserCollection {
    return this._userChannel?.friendsList || new UserCollection();
  }

  /**
   * Gets the user channel for the current user.
   */
  get userChannel(): UserChannel | undefined {
    return this._userChannel;
  }

  /**
   * Gets the room channels the user is in.
   * The key is the room id and the value is the room channel.
   */
  get roomChannels(): KeyedCollection<number, RoomChannel> {
    return this._roomChannels;
  }

  /**
   * Gets the active rooms the user is in.
   * The key is the room id and the value is the room.
   */
  get activeRooms(): RoomCollection {
    return this._activeRooms;
  }

  /**
   * The list of group chats the user is in.
   */
  get groups(): Room[] {
    return this._userChannel?.groups || [];
  }

  /**
   * The list of group chat ids the user is in.
   */
  get groupIds(): number[] {
    return this._userChannel?.groupIds || [];
  }

  /**
   * Gets the connection status of the chat manager.
   */
  get connected(): boolean {
    return this.grid.connected;
  }

  /**
   * The current client user.
   */
  get currentUser(): User | undefined {
    return this._userChannel?.currentUser;
  }

  /**
   * The internal user channel for the current user.
   * This channel is used for user specific events.
   */
  private _userChannel?: UserChannel;

  /**
   * The internal list of room channels the user is in.
   * The key is the room id and the value is the room channel.
   */
  private _roomChannels: KeyedCollection<
    number,
    RoomChannel
  > = new KeyedCollection();

  /**
   * The internal list of active rooms the user is in.
   * The key is the room id and the value is the room.
   */
  private _activeRooms: RoomCollection = new RoomCollection();

  /**
   * The internal time the chat client was started.
   */
  private _startTime: number;

  /**
   * The rate limiters for sending messages.
   * The key is the room id and the value is the rate
   * limiter for that room.
   */
  private rateLimiters: { [roomId: string]: RateLimiter } = {};

  /**
   * The cached media items.
   * The key is the media item id and the value is the
   * media item and the timestamp it was cached.
   */
  private cachedMediaItems: {
    [key: string]: { item: MediaItem; timestamp: number };
  } = {};

  /**
   * @param client The Game Jolt client.
   * @param options The chat manager options.
   */
  constructor(client: Client, grid: GridManager) {
    super();
    this.client = client;
    this.grid = grid;
    this.reset();
  }

  /**
   * Joins a room channel.
   *
   * This method creates a new `RoomChannel` instance for the specified room and attempts to join it.
   * Upon successful joining, it processes the response to set up the current room and its members.
   * Finally, it emits a "room_ready" event with the response data.
   * @param roomId The identifier of the room to join.
   */
  async joinRoom(roomId: number): Promise<void> {
    if (this._activeRooms.get(roomId) && this._roomChannels.get(roomId)) {
      this.client.logger.warn(`Already in room ${roomId}. Cannot join again.`);
      return;
    }

    const channel = new RoomChannel(roomId, this);
    await channel.joinRoomChannel();
  }

  /**
   * Leave a room channel.
   * @param roomId The identifier of the room to leave.
   */
  leaveRoom(roomId: number): void {
    const channel = this._roomChannels.get(roomId);
    if (channel) {
      this.grid.leaveChannel(channel);
      this._roomChannels.remove(roomId);
    }

    const activeRoom = this._activeRooms.get(roomId);
    if (activeRoom) {
      this._activeRooms.remove(roomId);
    }
  }

  /**
   * Joins the user to their personal chat channel.
   *
   * This method creates a new `UserChannel` instance for the current user and attempts to join it.
   * Upon successful joining, it processes the response to set up the current user, friends list,
   * groups, and group IDs. Finally, it emits a "chat_ready" event with the response data.
   */
  async joinUserChannel(): Promise<void> {
    const channel = new UserChannel(this.client.userId, this);

    this._userChannel = channel;

    await channel.joinUserChannel();
  }

  /**
   * Sends a message to a specified chat room.
   *
   * @param message The message to send. Can be a string or a Content object.
   *                - If a string is provided, it will be wrapped in a Content object with type "chat-message".
   *                - If a Content object is provided, it must have a valid structure and content.
   * @param roomId The Id of the chat room to send the message to.
   */
  async sendMessage(message: string | Content, roomId: number): Promise<void> {
    const roomChannel = this.validateRoomChannel(roomId);
    this.checkRateLimit(roomId);

    const contentJson = this.prepareContentJson(message);
    await this.pushMessageToRoom(roomChannel, contentJson, roomId);
  }

  private validateRoomChannel(roomId: number): RoomChannel {
    const roomChannel = this._roomChannels.get(roomId);
    if (!roomChannel) {
      throw new Error(`Room channel ${roomId} not found. Cannot send message.`);
    }
    return roomChannel;
  }

  private checkRateLimit(roomId: number): void {
    const rateLimiter = this.getRateLimiter(roomId);
    if (rateLimiter && rateLimiter.throttle()) {
      this.client.logger.warn(
        `Rate limit exceeded for room ${roomId}. Cannot send message.`
      );
      throw new Error(
        `Rate limit exceeded for room ${roomId}. Please try again later.`
      );
    }
  }

  private prepareContentJson(message: string | Content): string {
    const content = this.createContent(message);
    const contentJson = this.getContentJson(content);
    if (!contentJson) {
      this.client.logger.warn(`Invalid content format. Cannot send message.`);
      throw new Error(`Invalid content format. Cannot send message.`);
    }
    return contentJson;
  }

  private pushMessageToRoom(
    roomChannel: RoomChannel,
    contentJson: string,
    roomId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      roomChannel
        .push(Events.MESSAGE, { content: contentJson })
        .receive("ok", () => resolve())
        .receive("error", (error) =>
          reject(
            new Error(
              `Failed to send message to room ${roomId} with content ${JSON.stringify(
                contentJson
              )}: ${error}`
            )
          )
        );
    });
  }

  /**
   * Edits an existing chat message with new content.
   *
   * @param editedContent The new content for the message. Can be a string or a Content object.
   * @param message The message object that needs to be edited.
   * @returns A Push object representing the result of the message update operation.
   */
  editMessage(
    editedContent: string | Content,
    message: Message
  ): Push | undefined {
    const roomChannel = this.getRoomChannel(message.room_id);
    if (!roomChannel) {
      this.client.logger.warn(
        `Room channel ${message.room_id} not found. Cannot edit message.`
      );
      return;
    }

    const content = this.createContent(editedContent);
    const contentJson = this.getContentJson(content);
    if (contentJson) {
      return roomChannel.push(Events.MESSAGE_UPDATE, {
        content: contentJson,
        id: message.id,
      });
    }
  }

  /**
   * Uploads a file to a specified chat room.
   *
   * @param file The file to be uploaded, represented as a Readable stream.
   * @param roomId The Id of the chat room where the file will be uploaded.
   * @returns A promise that resolves to a MediaItem representing the uploaded file.
   * @throws Will throw an error if the temporary chat resource could not be created.
   */
  async uploadFile(file: fs.ReadStream, roomId: number): Promise<MediaItem> {
    const cacheKey = `${roomId}-${file.path}`;
    const cachedItem = this.cachedMediaItems[cacheKey];

    // Check if the item is cached and not expired.
    if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
      return cachedItem.item;
    }

    try {
      const temporaryChatResource = await this.client.api.media.chatTempResource(
        roomId
      );

      if (temporaryChatResource && temporaryChatResource.payload) {
        // Upload the media item to media server.
        const parentId = parseInt(temporaryChatResource.payload.id, 10);
        const response = await this.client.api.media.uploadMedia(
          file,
          parentId,
          "chat-message"
        );

        // Cache the media item.
        this.cachedMediaItems[cacheKey] = {
          item: response,
          timestamp: Date.now(),
        };
        this.cleanUpMediaItemCache();

        return response;
      } else {
        throw new Error("Temporary chat resource could not be created.");
      }
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Accept a chat invite.
   * @param inviteId The id of the invite.
   */
  acceptInvite(inviteId: number): Push {
    return this._userChannel.push(Events.INVITE_ACCEPT, {
      invite_id: inviteId,
    });
  }

  /**
   * Reset the chat client.
   */
  reset(): void {
    this._activeRooms = new RoomCollection();
    this._startTime = Date.now();
  }

  /**
   * Destroys the chat manager instance by performing the following actions:
   * - If not connected, the method returns immediately.
   * - Resets the chat manager state.
   * - Leaves the user channel if it exists and sets it to undefined.
   * - Iterates through all room channels and leaves each one.
   * - Clears the room channels object.
   * - If a socket connection exists, logs a message, disconnects the socket, and sets it to undefined.
   */
  destroy(): void {
    if (!this.connected) {
      this.client.logger.warn("Chat manager is not connected. Cannot destroy.");
      return;
    }

    this.reset();

    if (this._userChannel) {
      this.client.logger.info(
        `Leaving user channel for user Id: ${this._userChannel.userId}.`
      );
      this.grid.leaveChannel(this._userChannel);
      this._userChannel = undefined;
    }

    for (const roomId of this._roomChannels.keys()) {
      const roomChannel = this._roomChannels.get(roomId);
      if (roomChannel) {
        this.client.logger.info(`Leaving room channel for room Id: ${roomId}.`);
        this.grid.leaveChannel(roomChannel);
      }
    }

    this._roomChannels = new KeyedCollection();

    if (this.grid.socket) {
      this.client.logger.info("Disconnecting from chat socket...");
      this.grid.socket.disconnect();
      this.grid.socket = undefined;
    }
  }

  /**
   * Gets the rate limiter for the specified room ID.
   * @param roomId The ID of the room.
   * @returns The RateLimiter instance.
   */
  private getRateLimiter(roomId: number): RateLimiter {
    if (!this.rateLimiters[roomId]) {
      this.rateLimiters[roomId] = new RateLimiter(
        this.client.rateLimitRequests,
        this.client.rateLimitDuration
      );
    }
    return this.rateLimiters[roomId];
  }

  /**
   * Creates a Content object from the given message.
   * @param message The message to convert to Content.
   * @returns The Content object.
   */
  private createContent(message: string | Content): Content {
    if (typeof message === "string") {
      return new Content("chat-message", message);
    }
    return message;
  }

  /**
   * Gets the JSON representation of the Content object.
   * @param content The Content object.
   * @returns The JSON representation of the Content object or undefined if invalid.
   */
  private getContentJson(content: Content): string | undefined {
    const doc = ContentDocument.fromJson(content.contentJson());
    if (doc instanceof ContentDocument) {
      return doc.toJson();
    }
  }

  /**
   * Cleans up old cache entries.
   */
  private cleanUpMediaItemCache(): void {
    const now = Date.now();
    for (const key in this.cachedMediaItems) {
      if (now - this.cachedMediaItems[key].timestamp >= CACHE_DURATION) {
        delete this.cachedMediaItems[key];
      }
    }
  }
}
