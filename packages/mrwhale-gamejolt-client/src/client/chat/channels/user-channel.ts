import { Channel, Socket } from "phoenix-channels";

import { ChatManager } from "../chat-manager";
import { User } from "../../../structures/user";
import { Events } from "../../../constants";
import { Message } from "../../../structures/message";
import { Room } from "../../../structures/room";
import { FriendRemovePayload } from "../../../types/friend-remove-payload";
import { GroupAddPayload } from "../../../types/group-add-payload";
import { UserCollection } from "src/structures/user-collection";
import { UserChannelResponse } from "../../../types/user-channel-response";

const USER_TOPIC_PREFIX = "user:";

/**
 * Represents a user specific channel.
 * This class extends the base `Channel` class and handles various user-related events.
 */
export class UserChannel extends Channel {
  /**
   * The chat manager instance associated with this user channel.
   * This provides methods and properties to manage chat functionalities.
   */
  readonly chat: ChatManager;

  /**
   * The socket connection used by the user channel.
   * This is the same socket connection used by the chat manager.
   */
  readonly socket: Socket;

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
   * @param userId The Id of the user.
   * @param chat The chat manager instance.
   * @param params Optional parameters for the channel.
   */
  constructor(
    userId: number,
    chat: ChatManager,
    params?: Record<string, unknown>
  ) {
    super(USER_TOPIC_PREFIX + userId, params, chat.grid.socket as Socket);
    this.chat = chat;
    this.socket = chat.grid.socket as Socket;
    this.socket.channels.push(this);

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
  joinUserChannel(): void {
    this.join().receive("ok", (response: UserChannelResponse) => {
      const currentUser = new User(response.user);
      const friendsList = new UserCollection(response.friends || []);
      this._currentUser = currentUser;
      this._friendsList = friendsList;
      this._groups = response.groups;
      this._groupIds =
        response.groups_ids || this._groups.map((group) => group.id);
      this.chat.client.emit(Events.CHAT_READY, response);
    });
  }

  private onFriendAdd(data: Partial<User>): void {
    const { client } = this.chat;

    if (!data || !data.id || !data.username) {
      return;
    }

    const newFriend = new User(data);
    this.friendsList.add(newFriend);

    client.emit(Events.FRIEND_ADD, newFriend);
  }

  private onFriendRemove(data: FriendRemovePayload): void {
    const { client } = this.chat;

    if (!data || !data.user_id) {
      return;
    }

    const { user_id } = data;
    const friend = this.friendsList.get(user_id);

    if (friend) {
      if (friend.room_id) {
        this.chat.leaveRoom(friend.room_id);
      }
    }
    this.friendsList.remove(user_id);

    client.emit(Events.FRIEND_REMOVE, user_id);
  }

  private onFriendUpdated(data: Partial<User>): void {
    const { client } = this.chat;
    const userId = data.id;

    if (data && data.id && data.username) {
      this.friendsList.update(new User(data));
    }

    if (userId) {
      this.friendsList.update(new User(data));
    }

    client.emit(Events.FRIEND_UPDATED, userId);
  }

  private onNotification(data: Partial<Message>): void {
    const { client } = this.chat;

    if (!data || !data.id || !data.content || !data.user_id) {
      return;
    }

    client.emit(Events.NOTIFICATION, new Message(client, data));
  }

  private onYouUpdated(data: Partial<User>): void {
    const { client } = this.chat;

    if (!data || !data.id || !data.username) {
      return;
    }

    const newUser = new User(data);

    this._currentUser = newUser;

    client.emit(Events.YOU_UPDATED, newUser);
  }

  private onGroupAdd(data: GroupAddPayload): void {
    const { client } = this.chat;

    if (!data || !data.room) {
      return;
    }

    const { room } = data;

    this.groupIds.push(room.id);

    client.emit(Events.GROUP_ADD, new Room(room));
  }

  private onGroupLeave(data: { room_id: number }): void {
    const { client } = this.chat;

    if (!data || !data.room_id) {
      return;
    }

    const { room_id } = data;

    const index = this.groupIds.findIndex((id) => id === room_id);

    if (index !== -1) {
      this.chat.leaveRoom(room_id);
      this.groupIds.splice(index, 1);
    }

    client.emit(Events.GROUP_LEAVE, room_id);
  }
}
