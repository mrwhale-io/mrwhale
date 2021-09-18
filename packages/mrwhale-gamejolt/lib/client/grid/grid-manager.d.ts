/// <reference types="node" />
import * as events from "events";
import { Socket, Channel } from "phoenix-channels";
import { Client } from "../client";
import { GridManagerOptions } from "../../types/grid-manager-options";
/**
 * Manages the grid connection.
 */
export declare class GridManager extends events.EventEmitter {
    connected: boolean;
    socket: Socket | null;
    channels: Channel[];
    notificationChannel: Channel;
    readonly gridUrl: string;
    readonly client: Client;
    private frontend;
    /**
     * @param client The Game Jolt client.
     * @param options The grid manager options.
     */
    constructor(client: Client, options: GridManagerOptions);
    /**
     * Connects to grid.
     */
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    restart(sleepMs?: number): Promise<void>;
    /**
     * Leaves a phoenix channel.
     * @param channel The channel to leave.
     */
    leaveChannel(channel: Channel): void;
    private handleNotification;
}
