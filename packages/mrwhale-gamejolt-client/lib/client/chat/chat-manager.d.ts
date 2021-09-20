/// <reference types="node" />
import * as events from "events";
import { Socket, Channel, Push } from "phoenix-channels";
import { Readable } from "stream";
import { Client } from "../client";
import { User } from "../../structures/user";
import { UserCollection } from "../../structures/user-collection";
import { Room } from "../../structures/room";
import { RoomChannel } from "./channels/room-channel";
import { UserChannel } from "./channels/user-channel";
import { ChatManagerOptions } from "../../types/chat-manager-options";
import { MediaItem } from "../../structures/media-item";
import { Content } from "../../content/content";
import { Message } from "../../structures/message";
/**
 * Manages the websocket connection to the chat.
 */
export declare class ChatManager extends events.EventEmitter {
    connected: boolean;
    currentUser?: User;
    friendsList: UserCollection;
    socket?: Socket;
    userChannel?: UserChannel;
    groups: Room[];
    groupIds: number[];
    roomChannels: {
        [roomId: number]: RoomChannel;
    };
    activeRooms: {
        [roomId: number]: Room;
    };
    startTime: number;
    readonly chatUrl: string;
    readonly client: Client;
    private rateLimiters;
    private frontend;
    /**
     * @param client The Game Jolt client.
     * @param options The chat manager options.
     */
    constructor(client: Client, options: ChatManagerOptions);
    /**
     * Connects to the chat server.
     */
    connect(): Promise<void>;
    /**
     * Reconnects to the chat.
     */
    reconnect(): void;
    /**
     * Subscribe to a room channel.
     * @param roomId The identifier of the room to join.
     */
    joinRoom(roomId: number): Push;
    /**
     * Leave a room channel.
     * @param roomId The identifier of the room to leave.
     */
    leaveRoom(roomId: number): void;
    /**
     * Leaves a phoenix channel.
     * @param channel The channel to leave.
     */
    leaveChannel(channel: Channel): void;
    /**
     * Sends a chat message to the specified room.
     * @param message The chat message content.
     * @param roomId The identifier of the room to send message.
     */
    sendMessage(message: string | Content, roomId: number): Push;
    /**
     * Edits an existing message in chat.
     * @param editedContent The edited content.
     * @param message The message to edit.
     */
    editMessage(editedContent: string | Content, message: Message): Push;
    /**
     * Uploads a file to the Game Jolt media server.
     * @param file The file to upload.
     * @param resourceId The id of the resource.
     * @param context The content context.
     */
    uploadFile(file: Readable, roomId: number): Promise<MediaItem>;
    /**
     * Reset the chat client.
     */
    reset(): void;
    private destroy;
    private getAuth;
    private joinUserChannel;
}
