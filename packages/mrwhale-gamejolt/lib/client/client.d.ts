/// <reference types="node" />
import * as events from "events";
import { ChatManager } from "./chat/chat-manager";
import { Message } from "../structures/message";
import { ClientOptions } from "../types/client-options";
import { APIManager } from "./api/api-manager";
import { User } from "../structures/user";
import { GridManager } from "./grid/grid-manager";
import { Notification } from "../structures/notification";
/**
 * The main client for interacting with the chat and site api.
 */
export declare class Client extends events.EventEmitter {
    /**
     * The chat manager for interacting with the chat.
     */
    readonly chat: ChatManager;
    /**
     * The api manager for interacting with the site api.
     */
    readonly api: APIManager;
    /**
     * The grid manager.
     */
    readonly grid: GridManager;
    /**
     * The identifier of the client user.
     */
    readonly userId: number;
    /**
     * The max number of requests that can be made
     * before rate limiting.
     */
    rateLimitRequests: number;
    /**
     * The max duration of rate limiting.
     */
    rateLimitDuration: number;
    /**
     * @param options The client options.
     */
    constructor(options: ClientOptions);
    /**
     * Send a request to the site api to fetch the client user's friend requests.
     */
    fetchFriendRequests(): Promise<void>;
    on(event: "message", listener: (data: Message) => void): this;
    on(event: "notification", listener: (data: Message) => void): this;
    on(event: "user_updated", listener: (data: {
        room_id: number;
        user: User;
    }) => void): this;
    on(event: "friend_updated", listener: (data: number) => void): this;
    on(event: "friend_add", listener: (data: User) => void): this;
    on(event: "friend_remove", listener: (data: number) => void): this;
    on(event: "you_updated", listener: (data: User) => void): this;
    on(event: "member_add", listener: (data: {
        room_id: number;
        members: User[];
    }) => void): this;
    on(event: "member_leave", listener: (data: {
        room_id: number;
        member: User;
    }) => void): this;
    on(event: "owner_sync", listener: (data: {
        room_id: number;
        owner_id: number;
    }) => void): this;
    on(event: "user_notification", listener: (data: Notification) => void): this;
    /**
     * Initialise timers to send fetch requests.
     * This keeps the notification/friend requests and counts
     * up to date. This Should only be used internally.
     */
    private initTimers;
}
