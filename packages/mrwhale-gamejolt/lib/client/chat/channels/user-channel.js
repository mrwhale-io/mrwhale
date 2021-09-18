"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChannel = void 0;
const phoenix_channels_1 = require("phoenix-channels");
const user_1 = require("../../../structures/user");
const constants_1 = require("../../../constants");
const message_1 = require("../../../structures/message");
const room_1 = require("../../../structures/room");
class UserChannel extends phoenix_channels_1.Channel {
    constructor(userId, chat, params) {
        super("user:" + userId, params, chat.socket);
        this.chat = chat;
        this.socket = chat.socket;
        this.socket.channels.push(this);
        this.on(constants_1.Events.FRIEND_UPDATED, this.onFriendUpdated.bind(this));
        this.on(constants_1.Events.FRIEND_ADD, this.onFriendAdd.bind(this));
        this.on(constants_1.Events.FRIEND_REMOVE, this.onFriendRemove.bind(this));
        this.on(constants_1.Events.NOTIFICATION, this.onNotification.bind(this));
        this.on(constants_1.Events.YOU_UPDATED, this.onYouUpdated.bind(this));
        this.on(constants_1.Events.GROUP_ADD, this.onGroupAdd.bind(this));
        this.on(constants_1.Events.GROUP_LEAVE, this.onGroupLeave.bind(this));
    }
    onFriendAdd(data) {
        const { client } = this.chat;
        const newFriend = new user_1.User(data);
        this.chat.friendsList.add(newFriend);
        client.emit(constants_1.Events.FRIEND_ADD, newFriend);
    }
    onFriendRemove(data) {
        const { client } = this.chat;
        const { user_id } = data;
        const friend = client.chat.friendsList.get(user_id);
        if (friend) {
            this.chat.leaveRoom(friend.room_id);
        }
        this.chat.friendsList.remove(user_id);
        client.emit(constants_1.Events.FRIEND_REMOVE, user_id);
    }
    onFriendUpdated(data) {
        const { client } = this.chat;
        const userId = data.id;
        if (userId) {
            this.chat.friendsList.update(new user_1.User(data));
        }
        client.emit(constants_1.Events.FRIEND_UPDATED, userId);
    }
    onNotification(data) {
        const { client } = this.chat;
        client.emit(constants_1.Events.NOTIFICATION, new message_1.Message(client, data));
    }
    onYouUpdated(data) {
        const { client } = this.chat;
        const newUser = new user_1.User(data);
        this.chat.currentUser = newUser;
        client.emit(constants_1.Events.YOU_UPDATED, newUser);
    }
    onGroupAdd(data) {
        const { client } = this.chat;
        const { room } = data;
        this.chat.groupIds.push(room.id);
        client.emit(constants_1.Events.GROUP_ADD, new room_1.Room(room));
    }
    onGroupLeave(data) {
        const { client } = this.chat;
        const { room_id } = data;
        const index = this.chat.groupIds.findIndex((id) => id === room_id);
        if (index !== -1) {
            this.chat.leaveRoom(room_id);
            this.chat.groupIds.splice(index, 1);
        }
        client.emit(constants_1.Events.GROUP_LEAVE, room_id);
    }
}
exports.UserChannel = UserChannel;
