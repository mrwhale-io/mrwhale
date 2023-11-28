import { Channel, Socket } from "phoenix-channels";

import { ChatManager } from "../chat-manager";
import { User } from "../../../structures/user";
import { Room } from "../../../structures/room";
import { Message } from "../../../structures/message";
import { Events } from "../../../constants";

interface MemberAddPayload {
  members: User[];
}

interface MemberLeavePayload {
  user_id: number;
}

interface OwnerSyncPayload {
  owner_id: number;
}

interface MemberWatchload {
  members: User[];
}

export class RoomChannel extends Channel {
  room!: Room;
  roomId: number;
  readonly chat: ChatManager;
  readonly socket: Socket;

  constructor(
    roomId: number,
    chat: ChatManager,
    params?: Record<string, unknown>
  ) {
    const socket = chat.grid.socket;

    super("room:" + roomId, params, socket);
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

  private onMsg(data: Partial<Message>) {
    const { client } = this.chat;

    client.emit(Events.MESSAGE, new Message(client, data));
  }

  private onUserUpdated(data: Partial<User>) {
    const { client } = this.chat;
    const updatedUser = new User(data);

    client.emit(Events.USER_UPDATED, {
      room_id: this.roomId,
      user: updatedUser,
    });
  }

  private onMemberLeave(data: MemberLeavePayload) {
    const { client } = this.chat;
    const { user_id } = data;

    const activeRoom = this.chat.activeRooms[this.roomId];
    if (activeRoom) {
      const roomMembers = activeRoom.members;
      if (roomMembers) {
        const index = roomMembers.findIndex((member) => member.id === user_id);
        if (index !== -1) {
          const member = roomMembers.splice(index, 1)[0];

          client.emit(Events.MEMBER_LEAVE, {
            room_id: this.roomId,
            member,
          });
        }
      }
    }
  }

  private onMemberAdd(data: MemberAddPayload) {
    const { client } = this.chat;
    const newMembers = data.members || [];

    const activeRoom = this.chat.activeRooms[this.roomId];
    if (activeRoom && activeRoom.members) {
      if (activeRoom.members) {
        activeRoom.members.push(...newMembers);
      }
    }

    client.emit(Events.MEMBER_ADD, {
      room_id: this.roomId,
      members: newMembers,
    });
  }

  private onOwnerSync(data: OwnerSyncPayload) {
    const { client } = this.chat;
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
