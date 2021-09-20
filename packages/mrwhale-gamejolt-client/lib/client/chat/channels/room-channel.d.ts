import { Channel, Socket } from "phoenix-channels";
import { ChatManager } from "../chat-manager";
import { Room } from "../../../structures/room";
export declare class RoomChannel extends Channel {
    room: Room;
    roomId: number;
    readonly chat: ChatManager;
    readonly socket: Socket;
    constructor(roomId: number, chat: ChatManager, params?: Record<string, unknown>);
    private onMsg;
    private onUserUpdated;
    private onMemberLeave;
    private onMemberAdd;
    private onOwnerSync;
}
