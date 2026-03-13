import * as events from "events";
import { Readable } from "stream";
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
import { KeyedCollection } from "../../util/keyed-collection";

/**
 * Manages chat functionalities for the Game Jolt client.
 *
 * The `ChatManager` class extends `events.EventEmitter` and provides methods to handle chat operations such as joining and leaving rooms, sending and editing messages, uploading files, and managing user channels.
 *
 * @remarks
 * This class is responsible for maintaining the state of the chat client, including the current user, friends list, active rooms, and room channels. It also handles rate limiting for sending messages and provides methods to reset and destroy the chat manager instance.
 *
 * @fires ChatManager#message - When a new message is received
 * @fires ChatManager#room_ready - When a room has been successfully joined
 * @fires ChatManager#chat_ready - When the user channel has been established
 * @fires ChatManager#user_updated - When user information changes
 *
 * @example
 * ```typescript
 * const client = new Client({ userId: 12345, frontend: 'abc123', mrwhaleToken: 'token' });
 * await client.chat.joinUserChannel();
 *
 * // Listen for messages
 * client.chat.on('message', (message: Message) => {
 *   console.log(`${message.user.username}: ${message.textContent}`);
 * });
 *
 * // Join a room and send a message
 * await client.chat.joinRoom(67890);
 * await client.chat.sendMessage('Hello everyone!', 67890);
 * ```
 */
export class ChatManager extends events.EventEmitter {
  /**
   * Reference to the main Game Jolt client instance that owns this chat manager.
   * Provides access to API methods, authentication, and logging.
   * @readonly
   */
  readonly client: Client;

  /**
   * The Grid Manager instance responsible for managing WebSocket connections.
   * Handles low-level channel operations and connection lifecycle.
   * @readonly
   */
  readonly grid: GridManager;

  /**
   * Gets the timestamp when the chat client was initialized.
   * @returns The start time in milliseconds since Unix epoch.
   */
  get startTime(): number {
    return this._startTime;
  }

  /**
   * Gets the friends list for the current authenticated user.
   * @returns A UserCollection containing the user's friends, or empty collection if not connected.
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
  private _roomChannels: KeyedCollection<number, RoomChannel> =
    new KeyedCollection();

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
   * Creates a new ChatManager instance.
   *
   * @param client - The GameJolt client instance that will own this chat manager.
   * @param grid - The GridManager instance for handling WebSocket connections.
   */
  constructor(client: Client, grid: GridManager) {
    super();
    this.client = client;
    this.grid = grid;
    this.reset();
  }

  /**
   * Checks if the client is already in the specified room.
   * A room is considered "joined" if both the room channel and active room exist.
   *
   * @param roomId - The unique identifier of the room to check.
   * @returns `true` if the client is in the room, `false` otherwise.
   */
  isInRoom(roomId: number): boolean {
    return this._activeRooms.has(roomId) && this._roomChannels.has(roomId);
  }

  /**
   * Checks if the current user is the owner of the specified room.
   * @param roomId - The unique identifier of the room to check ownership for.
   * @returns `true` if the current user is the owner of the room, `false` otherwise.
   */
  isRoomOwner(roomId: number): boolean {
    const room = this._activeRooms.get(roomId);
    return room ? room.owner_id === this.client.userId : false;
  }

  /**
   * Joins a chat room and establishes a channel connection.
   *
   * This method creates a new `RoomChannel` instance for the specified room and attempts to join it.
   * Upon successful joining, it processes the response to set up the current room and its members.
   * Finally, it emits a "room_ready" event with the response data.
   *
   * @param roomId - The unique identifier of the room to join.
   * @throws {Error} When already in the specified room or if joining fails.
   *
   * @example
   * ```typescript
   * try {
   *   await chatManager.joinRoom(12345);
   *   console.log('Successfully joined room 12345');
   * } catch (error) {
   *   console.error('Failed to join room:', error.message);
   * }
   * ```
   */
  async joinRoom(roomId: number): Promise<void> {
    if (this.isInRoom(roomId)) {
      this.client.logger.warn(`Already in room ${roomId}. Cannot join again.`);
      return;
    }

    const channel = new RoomChannel(roomId, this);
    await channel.joinRoomChannel();
  }

  /**
   * Leaves a chat room and cleans up the associated channel.
   *
   * Removes the room from active rooms collection and disconnects from the room channel.
   * This operation is safe to call even if the room is not currently joined.
   *
   * @param roomId - The unique identifier of the room to leave.
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
   * @param message - The message content to send. Can be:
   *                  - A plain text string (will be wrapped in a Content object with type "chat-message")
   *                  - A Content object with rich formatting, mentions, etc.
   * @param roomId - The unique identifier of the chat room to send the message to.
   * @returns A Promise that resolves to the sent Message object.
   * @throws {Error} When the room channel is not found, rate limit is exceeded, or message format is invalid.
   *
   * @example
   * ```typescript
   * // Send plain text
   * const message = await chatManager.sendMessage('Hello world!', 12345);
   *
   * // Send rich content
   * const content = new Content('chat-message')
   *   .text('Hello ')
   *   .mention(user)
   *   .text('!');
   * const richMessage = await chatManager.sendMessage(content, 12345);
   * ```
   */
  async sendMessage(
    message: string | Content,
    roomId: number,
  ): Promise<Message> {
    const roomChannel = this.validateRoomChannel(roomId);
    this.checkRateLimit(roomId);

    const contentJson = this.prepareContentJson(message);
    return await this.pushMessageToRoom(roomChannel, contentJson);
  }

  /**
   * Edits an existing chat message with new content.
   *
   * @param editedContent - The new content for the message. Can be a string or a Content object.
   * @param message - The Message instance that needs to be edited.
   * @returns A Push object representing the message update operation, or `undefined` if the operation fails.
   * @throws {Error} When the room channel is not found or content format is invalid.
   *
   * @example
   * ```typescript
   * // Edit with plain text
   * const push = chatManager.editMessage('Updated message content', existingMessage);
   *
   * // Edit with rich content
   * const newContent = new Content('chat-message').text('Updated: ').bold('Important');
   * const push = chatManager.editMessage(newContent, existingMessage);
   * ```
   */
  editMessage(
    editedContent: string | Content,
    message: Message,
  ): Push | undefined {
    const roomChannel = this.getRoomChannel(message.room_id);
    if (!roomChannel) {
      this.client.logger.warn(
        `Room channel ${message.room_id} not found. Cannot edit message.`,
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
   * Uploads a file to a specific chat room.
   *
   * This method first creates a temporary chat resource to obtain a parent ID,
   * then uploads the file using that parent ID. The uploaded file becomes
   * a media item that can be shared in chat messages.
   *
   * @param file - The readable stream containing the file data to upload.
   * @param roomId - The unique identifier of the chat room to upload the file to.
   * @returns A Promise that resolves to the uploaded MediaItem.
   * @throws {Error} When the room doesn't exist, temporary resource creation fails,
   *                 upload fails, or invalid parameters are provided.
   *
   * @example
   * ```typescript
   * import { createReadStream } from 'fs';
   *
   * const fileStream = createReadStream('path/to/image.jpg');
   * try {
   *   const mediaItem = await chatManager.uploadFile(fileStream, 12345);
   *   console.log(`File uploaded successfully: ${mediaItem.filename}`);
   * } catch (error) {
   *   console.error('Upload failed:', error.message);
   * }
   * ```
   */
  async uploadFile(file: Readable, roomId: number): Promise<MediaItem> {
    // Verify the room exists and is accessible
    if (!this.isInRoom(roomId)) {
      this.client.logger.warn(
        `Attempting to upload file to room ${roomId} that is not joined.`,
      );
      throw new Error(`Cannot upload file: not currently in room ${roomId}.`);
    }

    this.client.logger.debug(`Starting file upload to room ${roomId}`);

    try {
      // Create temporary chat resource
      const temp = await this.client.api.media.chatTempResource(roomId);

      if (!temp || !temp.payload || !temp.payload.id) {
        this.client.logger.error(
          `Failed to create temporary chat resource for room ${roomId}`,
        );
        throw new Error("Failed to create temporary chat resource.");
      }

      const parentId = temp.payload.id;

      this.client.logger.debug(
        `Created temporary resource with parent ID: ${parentId}`,
      );

      // Upload the media file
      const response = await this.client.api.media.uploadMedia(
        file,
        parentId,
        "chat-message",
      );

      if (!response) {
        throw new Error("Upload completed but no media item was returned.");
      }

      this.client.logger.info(
        `Successfully uploaded file to room ${roomId}: ${
          response.filename || "unknown"
        }`,
      );
      return response;
    } catch (error) {
      this.client.logger.error(`File upload failed for room ${roomId}:`, error);

      // Re-throw with more context if it's our error
      if (error instanceof Error) {
        throw error;
      }

      // Handle unexpected errors
      throw new Error(`File upload failed: ${String(error)}`);
    }
  }

  /**
   * Accepts a chat room invitation.
   *
   * @param inviteId - The unique identifier of the invitation to accept.
   * @returns A Promise that resolves when the invite is successfully accepted.
   * @throws {Error} When the invite acceptance fails or user channel is not available.
   *
   * @example
   * ```typescript
   * try {
   *   await chatManager.acceptInvite(67890);
   *   console.log('Invite accepted successfully');
   * } catch (error) {
   *   console.error('Failed to accept invite:', error.message);
   * }
   * ```
   */
  async acceptInvite(inviteId: number): Promise<void> {
    if (!this._userChannel) {
      throw new Error("User channel not available. Cannot accept invite.");
    }

    return new Promise((resolve, reject) => {
      this._userChannel
        .push(Events.INVITE_ACCEPT, {
          invite_id: inviteId,
        })
        .receive("ok", () => {
          this.client.logger.info(`Successfully accepted invite: ${inviteId}`);
          resolve();
        })
        .receive("error", (error) => {
          this.client.logger.error(
            `Failed to accept invite ${inviteId}: ${error}`,
          );
          reject(new Error(`Failed to accept invite ${inviteId}: ${error}`));
        });
    });
  }

  /**
   * Kicks a member from a specified chat room.
   *
   * @param userId - The unique identifier of the user to be kicked
   * @param roomId - The unique identifier of the room from which to kick the user
   * @returns A Promise that resolves when the member is successfully kicked
   * @throws {Error} Throws an error if the kick operation fails or if the room channel is invalid
   */
  async kickMember(userId: number, roomId: number): Promise<void> {
    const roomChannel = this.validateRoomChannel(roomId);

    return new Promise((resolve, reject) => {
      roomChannel
        .push(Events.KICK_MEMBER, { member_id: userId })
        .receive("ok", () => {
          this.client.logger.info(`Successfully kicked member: ${userId}`);
          resolve();
        })
        .receive("error", (error) => {
          this.client.logger.error(`Failed to kick member ${userId}: ${error}`);
          reject(new Error(`Failed to kick member ${userId}: ${error}`));
        });
    });
  }

  /**
   * Resets the chat client state to initial values.
   *
   * This method:
   * - Clears all active rooms
   * - Clears all room channels
   * - Resets the start time to current timestamp
   * - Does not affect connection state or channels
   *
   * @remarks This is typically called during initialization or when reconnecting.
   */
  reset(): void {
    this._activeRooms = new RoomCollection();
    this._roomChannels = new KeyedCollection();
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
        `Leaving user channel for user Id: ${this._userChannel.userId}.`,
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
   * Validates that a room channel exists for the given room ID and returns it.
   *
   * @param roomId - The unique identifier of the room to validate.
   * @returns The RoomChannel instance associated with the given room ID.
   * @throws {Error} When the room channel is not found for the specified room ID.
   */
  private validateRoomChannel(roomId: number): RoomChannel {
    const roomChannel = this._roomChannels.get(roomId);
    if (!roomChannel) {
      throw new Error(`Room channel ${roomId} not found. Cannot send message.`);
    }
    return roomChannel;
  }

  /**
   * Checks if the rate limit for sending messages in the specified room has been exceeded.
   *
   * @param roomId - The unique identifier of the room to check the rate limit for.
   * @throws {Error} When the rate limit is exceeded for the specified room.
   */
  private checkRateLimit(roomId: number): void {
    const rateLimiter = this.getRateLimiter(roomId);
    if (rateLimiter && rateLimiter.throttle()) {
      this.client.logger.warn(
        `Rate limit exceeded for room ${roomId}. Cannot send message.`,
      );
      throw new Error(
        `Rate limit exceeded for room ${roomId}. Please try again later.`,
      );
    }
  }

  /**
   * Prepares the message content for sending by creating a Content object and converting it to JSON.
   * @param message - The message to prepare, either as a string or a Content object.
   * @returns The JSON representation of the message content.
   * @throws {Error} When the content format is invalid.
   */
  private prepareContentJson(message: string | Content): string {
    const content = this.createContent(message);
    const contentJson = this.getContentJson(content);
    if (!contentJson) {
      this.client.logger.warn(`Invalid content format. Cannot send message.`);
      throw new Error(`Invalid content format. Cannot send message.`);
    }
    return contentJson;
  }

  /**
   * Pushes a message to a specific room channel and returns a Promise that resolves to the created Message.
   *
   * @param roomChannel - The room channel to send the message to.
   * @param contentJson - The message content as a JSON string.
   * @returns A Promise that resolves to a Message instance when successful.
   * @throws {Error} When the message fails to send to the room.
   *
   * @private
   */
  private pushMessageToRoom(
    roomChannel: RoomChannel,
    contentJson: string,
  ): Promise<Message> {
    return new Promise((resolve, reject) => {
      roomChannel
        .push(Events.MESSAGE, { content: contentJson })
        .receive("ok", (response: Partial<Message>) =>
          resolve(new Message(this.client, response)),
        )
        .receive("error", (error) =>
          reject(
            new Error(
              `Failed to send message to room ${
                roomChannel.roomId
              } with content ${JSON.stringify(contentJson)}: ${error}`,
            ),
          ),
        );
    });
  }

  /**
   * Retrieves the room channel for the specified room ID.
   * @param roomId The ID of the room.
   * @returns The RoomChannel instance if found, or `undefined` if not found.
   */
  private getRoomChannel(roomId: number): RoomChannel | undefined {
    const roomChannel = this._roomChannels.get(roomId);
    if (!roomChannel) {
      this.client.logger.warn(`Room channel ${roomId} not found.`);
    }
    return roomChannel;
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
        this.client.rateLimitDuration,
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
}
