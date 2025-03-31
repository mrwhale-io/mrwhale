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
import { toUniqueWhaleSpeak } from "../../util/to-unique-whale-speak";
import { isAprilFools } from "../../util/is-april-fools";

/**
 * Manages the websocket connection to the chat.
 */
export class ChatManager extends events.EventEmitter {
  currentUser?: User;
  friendsList: UserCollection;
  userChannel?: UserChannel;
  groups: Room[] = [];
  groupIds: number[] = [];
  roomChannels: { [roomId: number]: RoomChannel } = {};
  activeRooms: { [roomId: number]: Room } = {};
  startTime: number;

  /**
   * A map containing whale translations.
   */
  readonly whaleTranslationMap: Map<string, string | Content> = new Map();

  /**
   * A list of active timeout IDs for whale translations.
   */
  private activeTimeouts: Set<NodeJS.Timeout> = new Set();

  readonly chatUrl: string;
  readonly client: Client;
  readonly grid: GridManager;

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
   * Sends a chat message to the specified room.
   * @param message The chat message content.
   * @param roomId The identifier of the room to send message.
   */
  sendMessage(
    message: string | Content,
    roomId: number,
    whaleSpeak: boolean = isAprilFools()
  ): Push {
    if (!this.rateLimiters[roomId]) {
      this.rateLimiters[roomId] = new RateLimiter(
        this.client.rateLimitRequests,
        this.client.rateLimitDuration
      );
    }

    if (!this.rateLimiters[roomId].throttle()) {
      let content: Content;
      if (typeof message === "string") {
        // Translate the message to whale speak
        if (whaleSpeak) {
          let whaleResponse: string;

          // Check if the message is already in the whaleTranslationMap
          for (const [key, value] of this.whaleTranslationMap.entries()) {
            if (value === message) {
              whaleResponse = key; // Reuse the existing translation
              break;
            }
          }

          if (!whaleResponse) {
            do {
              whaleResponse = toUniqueWhaleSpeak();
            } while (this.whaleTranslationMap.has(whaleResponse)); // Ensure uniqueness

            this.whaleTranslationMap.set(whaleResponse, message);

            // Remove the whale translation after 10 minutes
            const timeoutId = setTimeout(() => {
              this.whaleTranslationMap.delete(whaleResponse);
              this.activeTimeouts.delete(timeoutId);
            }, 10 * 60 * 1000);

            this.activeTimeouts.add(timeoutId);
          }
          message = whaleResponse;
        }

        const markdownRegex = /(\*\*|__|~~|`|```|#|\[.*?\]\(.*?\))/; // Common Markdown patterns
        const containsMarkdown = markdownRegex.test(message);

        if (containsMarkdown) {
          content = new Content("chat-message", message);
        } else {
          content = new Content().insertText(message);
        }
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

    // Clear all active timeouts
    this.activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.activeTimeouts.clear();

    // Clear the whale translation map
    this.whaleTranslationMap.clear();
  }

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
