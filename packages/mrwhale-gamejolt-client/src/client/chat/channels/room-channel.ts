import { Channel, Socket } from "phoenix-channels";

import { ChatManager } from "../chat-manager";
import { User } from "../../../structures/user";
import { Message } from "../../../structures/message";
import { Events } from "../../../constants";
import { MemberLeavePayload } from "../../../types/member-leave-payload";
import { MemberAddPayload } from "../../../types/member-add-payload";
import { OwnerSyncPayload } from "../../../types/owner-sync-payload";
import { Room } from "../../../structures/room";
import { Client } from "../../../client/client";

const ROOM_CHANNEL_TOPIC_PREFIX = "room:";

/**
 * Represents a room channel in the chat system.
 *
 * The `RoomChannel` class extends the base `Channel` class and provides
 * functionality for interacting with a specific chat room. It manages
 * the room's members, messages, and events, and integrates with the
 * chat manager and socket connection.
 *
 * ### Features:
 * - Join and leave room channels.
 * - Process server responses for room data and members.
 * - Handle various room-related events such as messages, user updates,
 *   Member additions/removals, and owner synchronization.
 * - Maintain an active room state and emit events to the client.
 *
 * ### Events:
 * - `MESSAGE`: Triggered when a new message is received in the room.
 * - `USER_UPDATED`: Triggered when a user's information is updated.
 * - `MEMBER_ADD`: Triggered when new members join the room.
 * - `MEMBER_LEAVE`: Triggered when members leave the room.
 * - `OWNER_SYNC`: Triggered when the room's owner is updated.
 * - `ROOM_READY`: Triggered when the room is successfully joined and ready.
 *
 * ### Usage:
 * This class is typically instantiated by the chat manager when a user
 * interacts with a specific room. It provides methods to join the room,
 * watch its members, and handle incoming events.
 */
export class RoomChannel extends Channel {
  /**
   * The room id associated with this channel.
   */
  readonly roomId: number;

  /**
   * The client associated with this channel.
   */
  readonly client: Client;

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
   * The chat manager instance associated with this room channel.
   * This provides methods and properties to manage chat functionalities.
   */
  private _chat: ChatManager;

  /**
   * The socket connection used by the room channel.
   * This is the same socket connection used by the chat manager.
   */
  private _socket: Socket;

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

    super(ROOM_CHANNEL_TOPIC_PREFIX + roomId, params, socket);
    this.roomId = roomId;
    this.client = chat.client;
    this._chat = chat;
    this._socket = socket;
    this._socket.channels.push(this);

    // Override the leave method to remove the channel from the socket's channels array
    const originalLeave = this.leave.bind(this);
    this.leave = () => {
      const index = this._socket.channels.indexOf(this);
      if (index !== -1) {
        this._socket.channels.splice(index, 1);
      }
      return originalLeave();
    };

    this.on(Events.MESSAGE, this.onMsg.bind(this));
    this.on(Events.USER_UPDATED, this.onUserUpdated.bind(this));
    this.on(Events.MEMBER_ADD, this.onMemberAdd.bind(this));
    this.on(Events.MEMBER_LEAVE, this.onMemberLeave.bind(this));
    this.on(Events.OWNER_SYNC, this.onOwnerSync.bind(this));
  }

  /**
   * Joins the room channel.
   *
   * This method attempts to join the room channel.
   * Upon successful joining, it processes the response to set up the current room and its members.
   * Finally, it emits a "room_ready" event with the response data.
   */
  async joinRoomChannel(): Promise<void> {
    try {
      const response = await this.attemptJoin();
      this.processJoinResponse(response);
      await this.watchMembers();
      this._chat.client.emit(Events.ROOM_READY, response);
      this._chat.client.logger.info(
        `Successfully joined room channel for room Id: ${this.roomId}`
      );
    } catch (error) {
      this._chat.client.logger.error(
        `Failed to join room channel for room Id: ${this.roomId}. Error: ${
          error.message || error
        }`
      );
    }
  }

  /**
   * Attempts to join the room channel.
   *
   * @returns A Promise that resolves with the server response if successful.
   * @throws An error if the join operation fails.
   */
  private attemptJoin(): Promise<{ room: Partial<Room> }> {
    return new Promise((resolve, reject) => {
      this.join()
        .receive("ok", (response: { room: Partial<Room> }) => resolve(response))
        .receive("error", reject);
    });
  }

  /**
   * Processes the response from the server after successfully joining the room channel.
   *
   * @param response The response data from the server.
   */
  private processJoinResponse(response: { room: Partial<Room> }): void {
    const room = new Room(this.client, response.room);
    this._room = room;
    this._chat.roomChannels[this.roomId] = this;
    this._chat.activeRooms.add(this.roomId, room);
  }

  /**
   * Watches the members of the room.
   *
   * Sends a MEMBER_WATCH event to the server and updates the room's members list.
   *
   * @returns A Promise that resolves when the members are successfully retrieved.
   * @throws An error if the MEMBER_WATCH operation fails.
   */
  private watchMembers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.push(Events.MEMBER_WATCH, {})
        .receive("ok", (response: { members: User[] }) => {
          if (this.room) {
            this.room.replaceMembers(response.members);
          }
          resolve();
        })
        .receive("error", reject);
    });
  }

  private onMsg(data: Partial<Message>): void {
    if (!data || !data.id || !data.content || !data.user_id) {
      this.logInvalidEventPayloadWarning(Events.MESSAGE, data);
      return;
    }

    this.client.emit(Events.MESSAGE, new Message(this.client, data));
  }

  private onUserUpdated(data: Partial<User>): void {
    if (!data || !data.id || !data.username) {
      this.logInvalidEventPayloadWarning(Events.USER_UPDATED, data);
      return;
    }

    const updatedUser = new User(data);

    this.client.emit(Events.USER_UPDATED, {
      room_id: this.roomId,
      user: updatedUser,
    });
  }

  private onMemberLeave(data: MemberLeavePayload): void {
    if (!data?.user_id) {
      this.logInvalidEventPayloadWarning(Events.MEMBER_LEAVE, data);
      return;
    }

    const { user_id } = data;

    const activeRoom = this._chat.activeRooms.get(this.roomId);
    if (!activeRoom) {
      this.client.logger.warn(
        `Active room not found for room Id: ${this.roomId}`
      );
      return;
    }

    const removedMember = activeRoom.removeMember(user_id);

    if (!removedMember) {
      this.client.logger.warn(
        `Room member with Id: ${user_id} not found in room Id: ${this.roomId}`
      );
      return;
    }

    this.client.emit(Events.MEMBER_LEAVE, {
      room_id: this.roomId,
      member: removedMember,
    });
  }

  private onMemberAdd(data: MemberAddPayload): void {
    if (!data || !Array.isArray(data.members)) {
      this.logInvalidEventPayloadWarning(Events.MEMBER_ADD, data);
      return;
    }

    const { members } = data;
    const activeRoom = this._chat.activeRooms.get(this.roomId);

    if (activeRoom?.members?.length && members.length > 0) {
      activeRoom.addMembers(members);
    }

    this.client.emit(Events.MEMBER_ADD, {
      room_id: this.roomId,
      members,
    });
  }

  private onOwnerSync(data: OwnerSyncPayload): void {
    if (!data || !data.owner_id) {
      this.logInvalidEventPayloadWarning(Events.OWNER_SYNC, data);
      return;
    }

    const { owner_id } = data;

    const activeRoom = this._chat.activeRooms.get(this.roomId);
    if (activeRoom) {
      activeRoom.updateOwner(owner_id);
    }

    this.client.emit(Events.OWNER_SYNC, {
      room_id: this.roomId,
      owner_id,
    });
  }

  private logInvalidEventPayloadWarning<T>(event: string, payload: T): void {
    const formattedPayload = JSON.stringify(payload, null, 2);
    const truncatedPayload =
      formattedPayload.length > 500
        ? `${formattedPayload.substring(0, 500)}... (truncated)`
        : formattedPayload;

    this.client.logger.warn(
      `Invalid event payload received for event: ${event}. Payload: ${truncatedPayload}`
    );
  }
}
