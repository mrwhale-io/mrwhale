"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomChannel = void 0;
const phoenix_channels_1 = require("phoenix-channels");
const user_1 = require("../../../structures/user");
const message_1 = require("../../../structures/message");
const constants_1 = require("../../../constants");
class RoomChannel extends phoenix_channels_1.Channel {
    constructor(roomId, chat, params) {
        const socket = chat.socket;
        super("room:" + roomId, params, socket);
        this.chat = chat;
        this.roomId = roomId;
        this.socket = socket;
        this.socket.channels.push(this);
        this.on(constants_1.Events.MESSAGE, this.onMsg.bind(this));
        this.on(constants_1.Events.USER_UPDATED, this.onUserUpdated.bind(this));
        this.on(constants_1.Events.MEMBER_LEAVE, this.onMemberLeave.bind(this));
        this.on(constants_1.Events.OWNER_SYNC, this.onOwnerSync.bind(this));
        this.on(constants_1.Events.MEMBER_ADD, this.onMemberAdd.bind(this));
    }
    onMsg(data) {
        const { client } = this.chat;
        client.emit(constants_1.Events.MESSAGE, new message_1.Message(client, data));
    }
    onUserUpdated(data) {
        const { client } = this.chat;
        const updatedUser = new user_1.User(data);
        client.emit(constants_1.Events.USER_UPDATED, {
            room_id: this.roomId,
            user: updatedUser,
        });
    }
    onMemberLeave(data) {
        const { client } = this.chat;
        const { user_id } = data;
        const activeRoom = this.chat.activeRooms[this.roomId];
        if (activeRoom) {
            const roomMembers = activeRoom.members;
            if (roomMembers) {
                const index = roomMembers.findIndex((member) => member.id === user_id);
                if (index !== -1) {
                    const member = roomMembers.splice(index, 1)[0];
                    client.emit(constants_1.Events.MEMBER_LEAVE, {
                        room_id: this.roomId,
                        member,
                    });
                }
            }
        }
    }
    onMemberAdd(data) {
        const { client } = this.chat;
        const newMembers = data.members || [];
        const activeRoom = this.chat.activeRooms[this.roomId];
        if (activeRoom && activeRoom.members) {
            if (activeRoom.members) {
                activeRoom.members.push(...newMembers);
            }
        }
        client.emit(constants_1.Events.MEMBER_ADD, {
            room_id: this.roomId,
            members: newMembers,
        });
    }
    onOwnerSync(data) {
        const { client } = this.chat;
        const { owner_id } = data;
        const activeRoom = this.chat.activeRooms[this.roomId];
        if (activeRoom) {
            activeRoom.owner_id = owner_id;
        }
        client.emit(constants_1.Events.OWNER_SYNC, {
            room_id: this.roomId,
            owner_id: owner_id,
        });
    }
}
exports.RoomChannel = RoomChannel;
