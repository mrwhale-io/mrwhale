"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatManager = void 0;
const axios_1 = require("axios");
const events = require("events");
const phoenix_channels_1 = require("phoenix-channels");
const user_1 = require("../../structures/user");
const user_collection_1 = require("../../structures/user-collection");
const rate_limiter_1 = require("./rate-limiter");
const poll_request_1 = require("../../util/poll-request");
const content_document_1 = require("../../content/content-document");
const room_1 = require("../../structures/room");
const room_channel_1 = require("./channels/room-channel");
const constants_1 = require("../../constants");
const user_channel_1 = require("./channels/user-channel");
const content_1 = require("../../content/content");
const AUTH_TIMEOUT = 3000;
/**
 * Manages the websocket connection to the chat.
 */
class ChatManager extends events.EventEmitter {
    /**
     * @param client The Game Jolt client.
     * @param options The chat manager options.
     */
    constructor(client, options) {
        super();
        this.groups = [];
        this.groupIds = [];
        this.roomChannels = {};
        this.activeRooms = {};
        this.rateLimiters = {};
        this.client = client;
        this.frontend = options.frontend;
        this.chatUrl = options.baseUrl || "https://chatex.gamejolt.com/chatex";
        this.reset();
        this.connect();
    }
    /**
     * Connects to the chat server.
     */
    async connect() {
        const [hostResult, tokenResult] = await this.getAuth();
        const host = `${hostResult.data}`;
        const token = tokenResult.data.token;
        this.socket = new phoenix_channels_1.Socket(host, {
            heartbeatIntervalMs: 30000,
            params: { token },
        });
        this.socket.connect();
        const socketAny = this.socket;
        socketAny.conn._client.config.maxReceivedFrameSize =
            64 * 1024 * 1024 * 1024;
        this.socket.onOpen(() => {
            this.connected = true;
        });
        // HACK
        // there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
        // this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
        // The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
        // eslint-disable-next-line no-prototype-builtins
        if (socketAny.hasOwnProperty("reconnectTimer")) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            socketAny.reconnectTimer = { scheduleTimeout: () => { }, reset: () => { } };
        }
        this.socket.onError((err) => {
            console.warn("[Chat] Got error from socket", err);
            this.reconnect();
        });
        this.socket.onClose((err) => {
            console.warn("[Chat] Socket closed unexpectedly", err);
            this.reconnect();
        });
        this.joinUserChannel();
    }
    /**
     * Reconnects to the chat.
     */
    reconnect() {
        this.destroy();
        this.connect();
    }
    /**
     * Subscribe to a room channel.
     * @param roomId The identifier of the room to join.
     */
    joinRoom(roomId) {
        if (this.activeRooms[roomId] && this.roomChannels[roomId]) {
            return;
        }
        const channel = new room_channel_1.RoomChannel(roomId, this);
        return channel.join().receive("ok", (response) => {
            this.roomChannels[roomId] = channel;
            this.activeRooms[roomId] = new room_1.Room(response.room);
        });
    }
    /**
     * Leave a room channel.
     * @param roomId The identifier of the room to leave.
     */
    leaveRoom(roomId) {
        const channel = this.roomChannels[roomId];
        if (channel) {
            this.leaveChannel(channel);
            delete this.roomChannels[roomId];
        }
        const activeRoom = this.activeRooms[roomId];
        if (activeRoom) {
            delete this.activeRooms[roomId];
        }
    }
    /**
     * Leaves a phoenix channel.
     * @param channel The channel to leave.
     */
    leaveChannel(channel) {
        channel.leave();
        if (this.socket) {
            this.socket.remove(channel);
        }
    }
    /**
     * Sends a chat message to the specified room.
     * @param message The chat message content.
     * @param roomId The identifier of the room to send message.
     */
    sendMessage(message, roomId) {
        if (!this.rateLimiters[roomId]) {
            this.rateLimiters[roomId] = new rate_limiter_1.RateLimiter(this.client.rateLimitRequests, this.client.rateLimitDuration);
        }
        if (!this.rateLimiters[roomId].throttle()) {
            let content;
            if (typeof message === "string") {
                content = new content_1.Content("chat-message", message);
            }
            else {
                content = message;
            }
            const doc = content_document_1.ContentDocument.fromJson(content.contentJson());
            if (doc instanceof content_document_1.ContentDocument) {
                const contentJson = doc.toJson();
                return this.roomChannels[roomId].push(constants_1.Events.MESSAGE, {
                    content: contentJson,
                });
            }
        }
    }
    /**
     * Edits an existing message in chat.
     * @param editedContent The edited content.
     * @param message The message to edit.
     */
    editMessage(editedContent, message) {
        let content;
        if (typeof editedContent === "string") {
            content = new content_1.Content("chat-message", editedContent);
        }
        else {
            content = editedContent;
        }
        const doc = content_document_1.ContentDocument.fromJson(content.contentJson());
        if (doc instanceof content_document_1.ContentDocument) {
            const contentJson = doc.toJson();
            return this.roomChannels[message.room_id].push(constants_1.Events.MESSAGE_UPDATE, {
                content: contentJson,
                id: message.id,
            });
        }
    }
    /**
     * Uploads a file to the Game Jolt media server.
     * @param file The file to upload.
     * @param resourceId The id of the resource.
     * @param context The content context.
     */
    async uploadFile(file, roomId) {
        const temp = await this.client.api.chatTempResource(roomId);
        if (temp && temp.data && temp.data.payload) {
            const parentId = parseInt(temp.data.payload.id, 10);
            const response = await this.client.api.mediaUpload(file, parentId, "chat-message");
            return response;
        }
        else {
            throw new Error("Temporary chat resource could not be created.");
        }
    }
    /**
     * Reset the chat client.
     */
    reset() {
        this.connected = false;
        this.currentUser = undefined;
        this.friendsList = new user_collection_1.UserCollection();
        this.activeRooms = {};
        this.groupIds = [];
        this.groups = [];
        this.startTime = Date.now();
    }
    destroy() {
        if (!this.connected) {
            return;
        }
        this.reset();
        if (this.userChannel) {
            this.leaveChannel(this.userChannel);
            this.userChannel = undefined;
        }
        Object.keys(this.roomChannels).forEach((roomId) => {
            this.leaveChannel(this.roomChannels[roomId]);
        });
        this.roomChannels = {};
        if (this.socket) {
            console.log("Disconnecting socket");
            this.socket.disconnect();
            this.socket = undefined;
        }
    }
    async getAuth() {
        return await poll_request_1.pollRequest("Auth to server", () => {
            return Promise.all([
                axios_1.default.get(`${this.chatUrl}/host`, { timeout: AUTH_TIMEOUT }),
                axios_1.default.post(`${this.chatUrl}/token`, { frontend: this.frontend }, { timeout: AUTH_TIMEOUT }),
            ]);
        });
    }
    joinUserChannel() {
        const channel = new user_channel_1.UserChannel(this.client.userId, this);
        channel.join().receive("ok", (response) => {
            const currentUser = new user_1.User(response.user);
            const friendsList = new user_collection_1.UserCollection(response.friends || []);
            this.userChannel = channel;
            this.currentUser = currentUser;
            this.friendsList = friendsList;
            this.groupIds = response.groups_ids;
            this.groups = response.groups;
            this.client.emit("chat_ready", response);
        });
    }
}
exports.ChatManager = ChatManager;
