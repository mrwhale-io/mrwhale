import { Channel, Socket } from "phoenix-channels";

import { ChatManager } from "../chat-manager";
import { User } from "../../../structures/user";
import { Events } from "../../../constants";
import { Message } from "../../../structures/message";
import { Room } from "../../../structures/room";

interface FriendRemovePayload {
  user_id: number;
}

interface GroupAddPayload {
  room: Partial<Room>;
}

export class UserChannel extends Channel {
  readonly chat: ChatManager;
  readonly socket: Socket;

  constructor(
    userId: number,
    chat: ChatManager,
    params?: Record<string, unknown>
  ) {
    super("user:" + userId, params, chat.grid.socket as Socket);
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

  private onFriendAdd(data: Partial<User>) {
    const { client } = this.chat;

    const newFriend = new User(data);
    this.chat.friendsList.add(newFriend);

    client.emit(Events.FRIEND_ADD, newFriend);
  }

  private onFriendRemove(data: FriendRemovePayload) {
    const { client } = this.chat;
    const { user_id } = data;
    const friend = client.chat.friendsList.get(user_id);

    if (friend) {
      this.chat.leaveRoom(friend.room_id);
    }
    this.chat.friendsList.remove(user_id);

    client.emit(Events.FRIEND_REMOVE, user_id);
  }

  private onFriendUpdated(data: Partial<User>) {
    const { client } = this.chat;
    const userId = data.id;

    if (userId) {
      this.chat.friendsList.update(new User(data));
    }

    client.emit(Events.FRIEND_UPDATED, userId);
  }

  private onNotification(data: Partial<Message>) {
    const { client } = this.chat;

    client.emit(Events.NOTIFICATION, new Message(client, data));
  }

  private onYouUpdated(data: Partial<User>) {
    const { client } = this.chat;
    const newUser = new User(data);

    this.chat.currentUser = newUser;

    client.emit(Events.YOU_UPDATED, newUser);
  }

  private onGroupAdd(data: GroupAddPayload) {
    const { client } = this.chat;
    const { room } = data;

    this.chat.groupIds.push(room.id);

    client.emit(Events.GROUP_ADD, new Room(room));
  }

  private onGroupLeave(data: { room_id: number }) {
    const { client } = this.chat;
    const { room_id } = data;

    const index = this.chat.groupIds.findIndex((id) => id === room_id);

    if (index !== -1) {
      this.chat.leaveRoom(room_id);
      this.chat.groupIds.splice(index, 1);
    }

    client.emit(Events.GROUP_LEAVE, room_id);
  }
}
