import { Channel, Socket } from "phoenix-channels";

import { ChatManager } from "../chat-manager";
import { User } from "../../../structures/user";
import { Events } from "../../../constants";
import { Message } from "../../../structures/message";
import { Room } from "../../../structures/room";
import { FriendRemovePayload } from "../../../types/friend-remove-payload";
import { GroupAddPayload } from "../../../types/group-add-payload";

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

  private onFriendAdd(data: Partial<User>): void {
    const { client } = this.chat;

    if (!data || !data.id || !data.username) {
      return;
    }

    const newFriend = new User(data);
    this.chat.friendsList.add(newFriend);

    client.emit(Events.FRIEND_ADD, newFriend);
  }

  private onFriendRemove(data: FriendRemovePayload): void {
    const { client } = this.chat;

    if (!data || !data.user_id) {
      return;
    }

    const { user_id } = data;
    const friend = client.chat.friendsList.get(user_id);

    if (friend) {
      if (friend.room_id) {
        this.chat.leaveRoom(friend.room_id);
      }
    }
    this.chat.friendsList.remove(user_id);

    client.emit(Events.FRIEND_REMOVE, user_id);
  }

  private onFriendUpdated(data: Partial<User>): void {
    const { client } = this.chat;
    const userId = data.id;
      if (data && data.id && data.username) {
        this.chat.friendsList.update(new User(data));
      }
    if (userId) {
      this.chat.friendsList.update(new User(data));
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

    this.chat.currentUser = newUser;

    client.emit(Events.YOU_UPDATED, newUser);
  }

  private onGroupAdd(data: GroupAddPayload): void {
    const { client } = this.chat;

    if (!data || !data.room) {
      return;
    }

    const { room } = data;

    this.chat.groupIds.push(room.id);

    client.emit(Events.GROUP_ADD, new Room(room));
  }

  private onGroupLeave(data: { room_id: number }): void {
    const { client } = this.chat;

    if (!data || !data.room_id) {
      return;
    }

    const { room_id } = data;

    const index = this.chat.groupIds.findIndex((id) => id === room_id);

    if (index !== -1) {
      this.chat.leaveRoom(room_id);
      this.chat.groupIds.splice(index, 1);
    }

    client.emit(Events.GROUP_LEAVE, room_id);
  }
}
