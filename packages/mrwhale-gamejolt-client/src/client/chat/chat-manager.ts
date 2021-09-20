import Axios from "axios";
import * as events from "events";
import { Socket, Channel, Push } from "phoenix-channels";
import { Readable } from "stream";

import { Client } from "../client";
import { User } from "../../structures/user";
import { UserCollection } from "../../structures/user-collection";
import { RateLimiter } from "./rate-limiter";
import { pollRequest } from "../../util/poll-request";
import { ContentDocument } from "../../content/content-document";
import { Room } from "../../structures/room";
import { RoomChannel } from "./channels/room-channel";
import { Events } from "../../constants";
import { UserChannel } from "./channels/user-channel";
import { ChatManagerOptions } from "../../types/chat-manager-options";
import { MediaItem } from "../../structures/media-item";
import { Content } from "../../content/content";
import { Message } from "../../structures/message";

const AUTH_TIMEOUT = 3000;

/**
 * Manages the websocket connection to the chat.
 */
export class ChatManager extends events.EventEmitter {
  connected: boolean;
  currentUser?: User;
  friendsList: UserCollection;
  socket?: Socket;
  userChannel?: UserChannel;
  groups: Room[] = [];
  groupIds: number[] = [];
  roomChannels: { [roomId: number]: RoomChannel } = {};
  activeRooms: { [roomId: number]: Room } = {};
  startTime: number;

  readonly chatUrl: string;
  readonly client: Client;

  private rateLimiters: { [roomId: string]: RateLimiter } = {};
  private frontend: string;

  /**
   * @param client The Game Jolt client.
   * @param options The chat manager options.
   */
  constructor(client: Client, options: ChatManagerOptions) {
    super();
    this.client = client;
    this.frontend = options.frontend;
    this.chatUrl = options.baseUrl || "https://chatex.gamejolt.com/chatex";
    this.reset();
    this.connect();
  }

  /**
   * Connects to the chat server.
   */
  async connect(): Promise<void> {
    const [hostResult, tokenResult] = await this.getAuth();
    const host = `${hostResult.data}`;
    const token = tokenResult.data.token;
    
    this.socket = new Socket(host, {
      heartbeatIntervalMs: 30000,
      params: { token },
    });
    
    this.socket.connect();
    const socketAny: any = this.socket;
    socketAny.conn._client.config.maxReceivedFrameSize =
      64 * 1024 * 1024 * 1024;

    this.socket.onOpen(() => {
      this.connected = true;
    });

    // HACK
    // there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
    // this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
    // The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
    // eslint-disable-next-line no-prototype-builtins
    if (socketAny.hasOwnProperty("reconnectTimer")) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      socketAny.reconnectTimer = { scheduleTimeout: () => {}, reset: () => {} };
    }

    this.socket.onError((err) => {
      console.warn("[Chat] Got error from socket", err);
      this.reconnect();
    });

    this.socket.onClose((err) => {
      console.warn("[Chat] Socket closed unexpectedly", err);
      this.reconnect();
    });

    this.joinUserChannel();
  }

  /**
   * Reconnects to the chat.
   */
  reconnect(): void {
    this.destroy();
    this.connect();
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
    });
  }

  /**
   * Leave a room channel.
   * @param roomId The identifier of the room to leave.
   */
  leaveRoom(roomId: number): void {
    const channel = this.roomChannels[roomId];
    if (channel) {
      this.leaveChannel(channel);
      delete this.roomChannels[roomId];
    }

    const activeRoom = this.activeRooms[roomId];
    if (activeRoom) {
      delete this.activeRooms[roomId];
    }
  }

  /**
   * Leaves a phoenix channel.
   * @param channel The channel to leave.
   */
  leaveChannel(channel: Channel): void {
    channel.leave();
    if (this.socket) {
      this.socket.remove(channel);
    }
  }

  /**
   * Sends a chat message to the specified room.
   * @param message The chat message content.
   * @param roomId The identifier of the room to send message.
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
   * Edits an existing message in chat.
   * @param editedContent The edited content.
   * @param message The message to edit.
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
   * Uploads a file to the Game Jolt media server.
   * @param file The file to upload.
   * @param resourceId The id of the resource.
   * @param context The content context.
   */
  async uploadFile(file: Readable, roomId: number): Promise<MediaItem> {
    const temp = await this.client.api.chatTempResource(roomId);

    if (temp && temp.data && temp.data.payload) {
      const parentId = parseInt(temp.data.payload.id, 10);
      const response = await this.client.api.mediaUpload(
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
   * Reset the chat client.
   */
  reset(): void {
    this.connected = false;
    this.currentUser = undefined;
    this.friendsList = new UserCollection();
    this.activeRooms = {};
    this.groupIds = [];
    this.groups = [];
    this.startTime = Date.now();
  }

  private destroy() {
    if (!this.connected) {
      return;
    }

    this.reset();

    if (this.userChannel) {
      this.leaveChannel(this.userChannel);
      this.userChannel = undefined;
    }

    Object.keys(this.roomChannels).forEach((roomId) => {
      this.leaveChannel(this.roomChannels[roomId]);
    });
    this.roomChannels = {};

    if (this.socket) {
      console.log("Disconnecting socket");
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  private async getAuth() {
    return await pollRequest("Auth to server", () => {
      return Promise.all([
        Axios.get(`${this.chatUrl}/host`, { timeout: AUTH_TIMEOUT }),
        Axios.post(
          `${this.chatUrl}/token`,
          { frontend: this.frontend },
          { timeout: AUTH_TIMEOUT }
        ),
      ]);
    });
  }

  private joinUserChannel() {
    const channel = new UserChannel(this.client.userId, this);

    channel.join().receive("ok", (response: any) => {
      const currentUser = new User(response.user);
      const friendsList = new UserCollection(response.friends || []);
      this.userChannel = channel;
      this.currentUser = currentUser;
      this.friendsList = friendsList;
      this.groupIds = response.groups_ids;
      this.groups = response.groups;
      this.client.emit("chat_ready", response);
    });
  }
}
