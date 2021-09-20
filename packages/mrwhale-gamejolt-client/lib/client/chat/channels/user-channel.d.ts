import { Channel, Socket } from "phoenix-channels";
import { ChatManager } from "../chat-manager";
export declare class UserChannel extends Channel {
    readonly chat: ChatManager;
    readonly socket: Socket;
    constructor(userId: number, chat: ChatManager, params?: Record<string, unknown>);
    private onFriendAdd;
    private onFriendRemove;
    private onFriendUpdated;
    private onNotification;
    private onYouUpdated;
    private onGroupAdd;
    private onGroupLeave;
}
