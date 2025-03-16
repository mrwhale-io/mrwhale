import * as events from "events";
import { Push } from "phoenix-channels";
import { Readable } from "stream";

import { Client } from "../client";
import { User } from "../../structures/user";
import { UserCollection } from "../../structures/user-collection";
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
   * The current client user.
   */
  currentUser?: User;

  /**
   * The list of friends for the current user.
   */
  friendsList: UserCollection;

  /**
   * The user channel for the current user.
   * This channel is used for user specific events.
   */
  userChannel?: UserChannel;

  /**
   * The list of group chats the user is in.
   */
  groups: Room[] = [];

  /**
   * The list of group chat ids the user is in.
   */
  groupIds: number[] = [];

  /**
   * The list of room channels the user is in.
   * The key is the room id and the value is the room channel.
   */
  roomChannels: { [roomId: number]: RoomChannel } = {};

  /**
   * The list of active rooms the user is in.
   * The key is the room id and the value is the room.
   */
  activeRooms: { [roomId: number]: Room } = {};

  /**
   * The time the chat client was started.
   */
  startTime: number;

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
   * Gets the connection status of the chat manager.
   */
  get connected(): boolean {
    return this.grid.connected;
  }

  private rateLimiters: { [roomId: string]: RateLimiter } = {};

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
   * Subscribe to a room channel.
   * @param roomId The identifier of the room to join.
   */
  joinRoom(roomId: number): Push {
    if (this.activeRooms[roomId] && this.roomChannels[roomId]) {
      return;
    }

    const channel = new RoomChannel(roomId, this);

    return channel.join().receive("ok", (response: { room: Partial<Room> }) => {
      this.roomChannels[roomId] = channel;
      this.activeRooms[roomId] = new Room(response.room);
      channel
        .push(Events.MEMBER_WATCH, {})
        .receive("ok", (response: { members: User[] }) => {
          this.activeRooms[roomId].members = response.members;
        });
    });
  }

  /**
   * Leave a room channel.
   * @param roomId The identifier of the room to leave.
   */
  leaveRoom(roomId: number): void {
    const channel = this.roomChannels[roomId];
    if (channel) {
      this.grid.leaveChannel(channel);
      delete this.roomChannels[roomId];
    }

    const activeRoom = this.activeRooms[roomId];
    if (activeRoom) {
      delete this.activeRooms[roomId];
    }
  }


  /**
   * Sends a message to a specified chat room.
   *
   * @param message The message to send. Can be a string or a Content object.
   * @param roomId The Id of the chat room to send the message to.
   * @returns A Push object if the message is successfully sent, otherwise undefined.
   */
  sendMessage(message: string | Content, roomId: number): Push {
    if (!this.rateLimiters[roomId]) {
      this.rateLimiters[roomId] = new RateLimiter(
        this.client.rateLimitRequests,
        this.client.rateLimitDuration
      );
    }

    if (!this.rateLimiters[roomId].throttle()) {
      let content: Content;
      if (typeof message === "string") {
        content = new Content("chat-message", message);
      } else {
        content = message;
      }

      const doc = ContentDocument.fromJson(content.contentJson());
      if (doc instanceof ContentDocument) {
        const contentJson = doc.toJson();
        return this.roomChannels[roomId].push(Events.MESSAGE, {
          content: contentJson,
        });
      }
    }
  }

  /**
   * Edits an existing chat message with new content.
   *
   * @param editedContent The new content for the message. Can be a string or a Content object.
   * @param message The message object that needs to be edited.
   * @returns A Push object representing the result of the message update operation.
   */
  editMessage(editedContent: string | Content, message: Message): Push {
    let content: Content;
    if (typeof editedContent === "string") {
      content = new Content("chat-message", editedContent);
    } else {
      content = editedContent;
    }

    const doc = ContentDocument.fromJson(content.contentJson());
    if (doc instanceof ContentDocument) {
      const contentJson = doc.toJson();
      return this.roomChannels[message.room_id].push(Events.MESSAGE_UPDATE, {
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
  async uploadFile(file: Readable, roomId: number): Promise<MediaItem> {
    const temp = await this.client.api.media.chatTempResource(roomId);

    if (temp && temp.payload) {
      const parentId = parseInt(temp.payload.id, 10);
      const response = await this.client.api.media.uploadMedia(
        file,
        parentId,
        "chat-message"
      );

      return response;
    } else {
      throw new Error("Temporary chat resource could not be created.");
    }
  }

  /**
   * Accept a chat invite.
   * @param inviteId The id of the invite.
   */
  acceptInvite(inviteId: number): Push {
    return this.userChannel.push(Events.INVITE_ACCEPT, {
      invite_id: inviteId,
    });
  }

  /**
   * Reset the chat client.
   */
  reset(): void {
    this.currentUser = undefined;
    this.friendsList = new UserCollection();
    this.activeRooms = {};
    this.groupIds = [];
    this.groups = [];
    this.startTime = Date.now();
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
      return;
    }

    this.reset();

    if (this.userChannel) {
      this.grid.leaveChannel(this.userChannel);
      this.userChannel = undefined;
    }

    Object.keys(this.roomChannels).forEach((roomId) => {
      this.grid.leaveChannel(this.roomChannels[roomId]);
    });
    this.roomChannels = {};

    if (this.grid.socket) {
      console.log("Disconnecting socket");
      this.grid.socket.disconnect();
      this.grid.socket = undefined;
    }
  }

  /**
   * Joins the user to their personal chat channel.
   *
   * This method creates a new `UserChannel` instance for the current user and attempts to join it.
   * Upon successful joining, it processes the response to set up the current user, friends list,
   * groups, and group IDs. Finally, it emits a "chat_ready" event with the response data.
   */
  joinUserChannel(): void {
    const channel = new UserChannel(this.client.userId, this);

    channel.join().receive("ok", (response: any) => {
      const currentUser = new User(response.user);
      const friendsList = new UserCollection(response.friends || []);
      this.userChannel = channel;
      this.currentUser = currentUser;
      this.friendsList = friendsList;
      this.groups = response.groups;
      this.groupIds =
        response.groups_ids || this.groups.map((group) => group.id);
      this.client.emit("chat_ready", response);
    });
  }
}
