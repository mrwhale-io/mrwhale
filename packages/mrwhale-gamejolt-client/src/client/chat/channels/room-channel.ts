import { Channel, Push, Socket } from "phoenix-channels";

import { ChatManager } from "../chat-manager";
import { User } from "../../../structures/user";
import { Message } from "../../../structures/message";
import { Events } from "../../../constants";
import { MemberLeavePayload } from "../../../types/member-leave-payload";
import { MemberAddPayload } from "../../../types/member-add-payload";
import { OwnerSyncPayload } from "../../../types/owner-sync-payload";
import { Room } from "../../../structures/room";

const ROOM_TOPIC_PREFIX = "room:";

/**
 * Represents a room chat channel.
 * This class extends the base `Channel` class and handles various room-related events.
 *
 * The `RoomChannel` class is responsible for managing the communication within a specific chat room.
 * It listens to various events such as messages, user updates, member additions, member leaves, and owner synchronization.
 *
 * Example usage:
 * ```typescript
 * const chatManager = new ChatManager(socket);
 * const roomChannel = new RoomChannel(123, chatManager);
 *
 * roomChannel.join()
 *   .receive("ok", response => { console.log("Joined successfully", response); })
 *   .receive("error", response => { console.error("Failed to join", response); });
 *
 * roomChannel.on("message", (message) => {
 *   console.log("New message received:", message);
 * });
 * ```
 */
export class RoomChannel extends Channel {
  /**
   * The room id associated with this channel.
   */
  readonly roomId: number;

  /**
   * The chat manager instance associated with this room channel.
   * This provides methods and properties to manage chat functionalities.
   */
  readonly chat: ChatManager;

  /**
   * The socket connection used by the room channel.
   * This is the same socket connection used by the chat manager.
   */
  readonly socket: Socket;

  /**
   * Gets the room associated with this channel.
   */
  get room(): Room | undefined {
    return this._room;
  }

  /**
   * The current room associated with this channel.
   */
  private _room?: Room;

  /**
   * @param roomId The Id of the room.
   * @param chat The chat manager instance.
   * @param params Optional parameters for the channel.
   */
  constructor(
    roomId: number,
    chat: ChatManager,
    params?: Record<string, unknown>
  ) {
    const socket = chat.grid.socket;

    super(ROOM_TOPIC_PREFIX + roomId, params, socket);
    this.chat = chat;
    this.roomId = roomId;
    this.socket = socket;
    this.socket.channels.push(this);

    this.on(Events.MESSAGE, this.onMsg.bind(this));
    this.on(Events.USER_UPDATED, this.onUserUpdated.bind(this));
    this.on(Events.MEMBER_LEAVE, this.onMemberLeave.bind(this));
    this.on(Events.OWNER_SYNC, this.onOwnerSync.bind(this));
    this.on(Events.MEMBER_ADD, this.onMemberAdd.bind(this));
  }

  /**
   * Joins the room channel.
   *
   * This method attempts to join the room channel.
   * Upon successful joining, it processes the response to set up the current room and its members.
   * Finally, it emits a "room_ready" event with the response data.
   */
  joinRoom(): Push {
    return this.join().receive("ok", (response: { room: Partial<Room> }) => {
      const room = new Room(response.room);
      this._room = room;
      this.chat.roomChannels[this.roomId] = this;
      this.chat.activeRooms[this.roomId] = room;
      this.push(Events.MEMBER_WATCH, {}).receive(
        "ok",
        (response: { members: User[] }) => {
          this.room.members = response.members;
        }
      );
      this.chat.client.emit(Events.ROOM_READY, response);
    });
  }

  private onMsg(data: Partial<Message>): void {
    const { client } = this.chat;

    if (!data || !data.id || !data.content || !data.user_id) {
      return;
    }

    client.emit(Events.MESSAGE, new Message(client, data));
  }

  private onUserUpdated(data: Partial<User>): void {
    const { client } = this.chat;

    if (!data || !data.id || !data.username) {
      return;
    }

    const updatedUser = new User(data);

    client.emit(Events.USER_UPDATED, {
      room_id: this.roomId,
      user: updatedUser,
    });
  }

  private onMemberLeave(data: MemberLeavePayload): void {
    const { client } = this.chat;

    if (!data || !data.user_id) {
      return;
    }

    const { user_id } = data;

    const activeRoom = this.chat.activeRooms[this.roomId];
    if (!activeRoom) {
      return;
    }

    const roomMembers = activeRoom.members;
    if (!roomMembers) {
      return;
    }

    const index = roomMembers.findIndex((member) => member.id === user_id);
    if (index !== -1) {
      const member = roomMembers.splice(index, 1)[0];

      client.emit(Events.MEMBER_LEAVE, {
        room_id: this.roomId,
        member,
      });
    }
  }

  private onMemberAdd(data: MemberAddPayload): void {
    const { client } = this.chat;

    if (!data || !Array.isArray(data.members)) {
      return;
    }

    const newMembers = data.members || [];

    const activeRoom = this.chat.activeRooms[this.roomId];
    if (activeRoom && activeRoom.members) {
      activeRoom.members.push(...newMembers);
    }

    client.emit(Events.MEMBER_ADD, {
      room_id: this.roomId,
      members: newMembers,
    });
  }

  private onOwnerSync(data: OwnerSyncPayload): void {
    const { client } = this.chat;

    if (!data || !data.owner_id) {
      return;
    }

    const { owner_id } = data;

    const activeRoom = this.chat.activeRooms[this.roomId];
    if (activeRoom) {
      activeRoom.owner_id = owner_id;
    }

    client.emit(Events.OWNER_SYNC, {
      room_id: this.roomId,
      owner_id: owner_id,
    });
  }
}
