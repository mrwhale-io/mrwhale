import { Channel, Socket } from "phoenix-channels";

import { ChatManager } from "../chat-manager";
import { User } from "../../../structures/user";
import { Events } from "../../../constants";
import { Message } from "../../../structures/message";
import { Room } from "../../../structures/room";
import { UserCollection } from "../../../collections/user-collection";
import { UserChannelResponse } from "../../../types/user-channel-response";
import { pollRequest } from "../../../util/poll-request";
import { Client } from "../../../client/client";
import { FriendRemovePayload, GroupAddPayload } from "../../../types/payloads";

const USER_CHANNEL_TOPIC_PREFIX = "user:";

/**
 * Represents a user-specific chat channel in the system.
 *
 * The `UserChannel` class extends the base `Channel` class and provides
 * functionality for managing user-specific chat interactions, such as
 * handling friends, group chats, and notifications. It also integrates
 * with the chat manager and socket connection to facilitate real-time
 * communication.
 *
 * ### Features:
 * - Maintains the current user's information.
 * - Manages the user's friends list and group chats.
 * - Handles various chat-related events, such as friend updates, group
 *   additions, and notifications.
 * - Provides methods to join the user channel and process server responses.
 *
 * ### Events:
 * - `FRIEND_UPDATED`: Triggered when a friend's information is updated.
 * - `FRIEND_ADD`: Triggered when a new friend is added.
 * - `FRIEND_REMOVE`: Triggered when a friend is removed.
 * - `NOTIFICATION`: Triggered when a new notification is received.
 * - `YOU_UPDATED`: Triggered when the current user's information is updated.
 * - `GROUP_ADD`: Triggered when a new group chat is added.
 * - `GROUP_LEAVE`: Triggered when the user leaves a group chat.
 *
 * ### Usage:
 * This class is instantiated with a user ID, a chat manager instance, and
 * optional parameters. It automatically subscribes to relevant events and
 * manages the user's chat-related data.
 */
export class UserChannel extends Channel {
  /**
   * The identifier of the user.
   */
  readonly userId: number;

  /**
   * The client associated with this channel.
   */
  readonly client: Client;

  /**
   * Gets the current user.
   */
  get currentUser(): User | undefined {
    return this._currentUser;
  }

  /**
   * Gets the list of friends for the current user.
   */
  get friendsList(): UserCollection {
    return this._friendsList;
  }

  /**
   * Gets the list of group chats the user is in.
   */
  get groups(): Room[] {
    return this._groups;
  }

  /**
   * Gets the list of group chat ids the user is in.
   */
  get groupIds(): number[] {
    return this._groupIds;
  }

  /**
   * The current user.
   */
  private _currentUser?: User;

  /**
   * The list of friends for the current user.
   */
  private _friendsList: UserCollection;

  /**
   * The list of group chats the user is in.
   */
  private _groups: Room[] = [];

  /**
   * The list of group chat ids the user is in.
   */
  private _groupIds: number[] = [];

  /**
   * The chat manager instance associated with this user channel.
   * This provides methods and properties to manage chat functionalities.
   */
  private _chat: ChatManager;

  /**
   * The socket connection used by the user channel.
   * This is the same socket connection used by the chat manager.
   */
  private _socket: Socket;

  /**
   * @param userId The Id of the user.
   * @param chat The chat manager instance.
   * @param params Optional parameters for the channel.
   */
  constructor(
    userId: number,
    chat: ChatManager,
    params?: Record<string, unknown>,
  ) {
    super(
      USER_CHANNEL_TOPIC_PREFIX + userId,
      params,
      chat.grid.socket as Socket,
    );
    this.userId = userId;
    this.client = chat.client;
    this._chat = chat;
    this._socket = chat.grid.socket as Socket;
    this._socket.channels.push(this);

    this.on(Events.FRIEND_UPDATED, this.onFriendUpdated.bind(this));
    this.on(Events.FRIEND_ADD, this.onFriendAdd.bind(this));
    this.on(Events.FRIEND_REMOVE, this.onFriendRemove.bind(this));
    this.on(Events.NOTIFICATION, this.onNotification.bind(this));
    this.on(Events.YOU_UPDATED, this.onYouUpdated.bind(this));
    this.on(Events.GROUP_ADD, this.onGroupAdd.bind(this));
    this.on(Events.GROUP_LEAVE, this.onGroupLeave.bind(this));
  }

  /**
   * Joins the user to their personal channel.
   *
   * This method attempts to join the user channel.
   * Upon successful joining, it processes the response to set up the current user, friends list,
   * groups, and group IDs. Finally, it emits a "chat_ready" event with the response data.
   */
  async joinUserChannel(): Promise<void> {
    try {
      const response = await pollRequest<UserChannelResponse>(
        "Join user channel",
        () =>
          new Promise((resolve, reject) => {
            this.join()
              .receive("ok", (response: UserChannelResponse) =>
                resolve(response),
              )
              .receive("error", reject);
          }),
      );
      this.processJoinResponse(response);
      this.client.emit(Events.CHAT_READY, response);
      this.client.logger.info(
        `Successfully joined user channel for user Id: ${this.userId}.`,
      );
    } catch (error) {
      this.client.logger.error(
        `Failed to join user channel for user Id: ${this.userId}. Error: ${
          error.message || error
        }`,
      );
    }
  }

  /**
   * Processes the response from the server after successfully joining the user channel.
   *
   * @param response The response data from the server.
   */
  private processJoinResponse(response: UserChannelResponse): void {
    const currentUser = new User(response.user);
    const friendsList = new UserCollection(response.friends || []);
    this._currentUser = currentUser;
    this._friendsList = friendsList;
    this._groups = response.groups;
    this._groupIds =
      response.groups_ids || this._groups.map((group) => group.id);
  }

  private onFriendAdd(data: Partial<User>): void {
    if (!data || !data.id || !data.username) {
      this.logInvalidEventPayloadWarning(Events.FRIEND_ADD, data);
      return;
    }

    const newFriend = new User(data);
    this.friendsList.add(newFriend);

    this.client.emit(Events.FRIEND_ADD, newFriend);
  }

  private onFriendRemove(data: FriendRemovePayload): void {
    if (!data || !data.user_id) {
      this.logInvalidEventPayloadWarning(Events.FRIEND_REMOVE, data);
      return;
    }

    const { user_id } = data;
    const friend = this.friendsList.get(user_id);

    if (friend) {
      if (friend.room_id) {
        this._chat.leaveRoom(friend.room_id);
      }
    }
    this.friendsList.remove(user_id);

    this.client.emit(Events.FRIEND_REMOVE, user_id);
  }

  private onFriendUpdated(data: Partial<User>): void {
    const userId = data.id;

    if (data && data.id && data.username) {
      this.friendsList.update(new User(data));
    }

    this.client.emit(Events.FRIEND_UPDATED, userId);
  }

  private onNotification(data: Partial<Message>): void {
    if (!data || !data.id || !data.content || !data.user_id) {
      this.logInvalidEventPayloadWarning(Events.NOTIFICATION, data);
      return;
    }

    this.client.emit(Events.NOTIFICATION, new Message(this.client, data));
  }

  private onYouUpdated(data: Partial<User>): void {
    if (!data || !data.id || !data.username) {
      this.logInvalidEventPayloadWarning(Events.YOU_UPDATED, data);
      return;
    }

    const newUser = new User(data);

    this._currentUser = newUser;

    this.client.emit(Events.YOU_UPDATED, newUser);
  }

  private onGroupAdd(data: GroupAddPayload): void {
    if (!data || !data.room) {
      this.logInvalidEventPayloadWarning(Events.GROUP_ADD, data);
      return;
    }

    const { room } = data;

    this.groupIds.push(room.id);

    this.client.emit(Events.GROUP_ADD, new Room(this.client, room));
  }

  private onGroupLeave(data: { room_id: number }): void {
    if (!data || !data.room_id) {
      this.logInvalidEventPayloadWarning(Events.GROUP_LEAVE, data);
      return;
    }

    const { room_id } = data;

    const index = this.groupIds.findIndex((id) => id === room_id);

    if (index !== -1) {
      this._chat.leaveRoom(room_id);
      this.groupIds.splice(index, 1);
    }

    this.client.emit(Events.GROUP_LEAVE, room_id);
  }

  private logInvalidEventPayloadWarning<T>(event: string, payload: T): void {
    const formattedPayload = JSON.stringify(payload, null, 2);
    const truncatedPayload =
      formattedPayload.length > 500
        ? `${formattedPayload.substring(0, 500)}... (truncated)`
        : formattedPayload;

    this.client.logger.warn(
      `Invalid event payload received for event: ${event}. Payload: ${truncatedPayload}`,
    );
  }
}
