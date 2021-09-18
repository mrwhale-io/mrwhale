"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridManager = void 0;
const axios_1 = require("axios");
const events = require("events");
const phoenix_channels_1 = require("phoenix-channels");
const poll_request_1 = require("../../util/poll-request");
const notification_1 = require("../../structures/notification");
/**
 * List of resolvers waiting for grid to connect.
 * These resolvers get resolved in the connect function once Grid connected.
 */
let connectionResolvers = [];
/**
 * Manages the grid connection.
 */
class GridManager extends events.EventEmitter {
    /**
     * @param client The Game Jolt client.
     * @param options The grid manager options.
     */
    constructor(client, options) {
        super();
        this.connected = false;
        this.channels = [];
        this.client = client;
        this.gridUrl = options.baseUrl || "https://grid.gamejolt.com/grid/host";
        this.frontend = options.frontend;
        console.log(this.gridUrl, this.frontend);
        this.connect();
    }
    /**
     * Connects to grid.
     */
    async connect() {
        // get hostname from loadbalancer first
        const hostResult = await poll_request_1.pollRequest("Select server", () => axios_1.default.get(this.gridUrl, {
            timeout: 3000,
        }));
        const host = `${hostResult.data}/grid/socket`;
        this.socket = new phoenix_channels_1.Socket(host, {
            heartbeatIntervalMs: 30000,
        });
        // HACK
        // there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
        // this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
        // The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
        const socketAny = this.socket;
        // eslint-disable-next-line no-prototype-builtins
        if (socketAny.hasOwnProperty("reconnectTimer")) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            socketAny.reconnectTimer = { scheduleTimeout: () => { }, reset: () => { } };
        }
        await poll_request_1.pollRequest("Connect to socket", () => new Promise((resolve) => {
            if (this.socket !== null) {
                this.socket.connect();
            }
            resolve();
        }));
        const channel = this.socket.channel("notifications:" + this.client.userId, {
            frontend_cookie: this.frontend,
        });
        this.notificationChannel = channel;
        await poll_request_1.pollRequest("Join user notification channel", () => new Promise((resolve, reject) => {
            channel
                .join()
                .receive("error", reject)
                .receive("ok", () => {
                this.connected = true;
                this.channels.push(channel);
                for (const resolver of connectionResolvers) {
                    resolver();
                }
                connectionResolvers = [];
                resolve();
            });
        }));
        channel.on("new-notification", (payload) => this.handleNotification(payload));
        channel.onError((reason) => {
            console.log(`[Grid] Connection error encountered (Reason: ${reason}).`);
            this.restart(0);
        });
    }
    async disconnect() {
        if (this.connected) {
            this.connected = false;
            this.channels.forEach((channel) => {
                this.leaveChannel(channel);
            });
            this.channels = [];
            this.notificationChannel = null;
            if (this.socket !== null) {
                this.socket.disconnect();
                this.socket = null;
            }
        }
    }
    async restart(sleepMs = 2000) {
        // sleep a bit before trying to reconnect
        await new Promise((resolve) => {
            setTimeout(resolve, sleepMs);
        });
        // teardown and try to reconnect
        if (this.connected) {
            await this.disconnect();
            this.connect();
        }
    }
    /**
     * Leaves a phoenix channel.
     * @param channel The channel to leave.
     */
    leaveChannel(channel) {
        channel.leave();
        if (this.socket !== null) {
            this.socket.remove(channel);
        }
    }
    handleNotification(payload) {
        const data = payload.notification_data.event_item;
        const notification = new notification_1.Notification(data);
        this.client.emit("user_notification", notification);
    }
}
exports.GridManager = GridManager;
