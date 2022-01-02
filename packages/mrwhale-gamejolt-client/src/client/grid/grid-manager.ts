import Axios from "axios";
import * as events from "events";
import { Socket, Channel } from "phoenix-channels";
import { pollRequest } from "../../util/poll-request";

import { Client } from "../client";
import { GridManagerOptions } from "../../types/grid-manager-options";
import { Notification } from "../../structures/notification";
import { GJ_PLATFORM_VERSION } from "../../constants";

interface NewNotificationPayload {
  notification_data: {
    event_item: any;
  };
}

/**
 * List of resolvers waiting for grid to connect.
 * These resolvers get resolved in the connect function once Grid connected.
 */
let connectionResolvers: (() => void)[] = [];

/**
 * Manages the grid connection.
 */
export class GridManager extends events.EventEmitter {
  connected = false;
  socket: Socket | null;
  channels: Channel[] = [];
  notificationChannel: Channel;
  readonly gridUrl: string;
  readonly client: Client;

  private frontend: string;

  /**
   * @param client The Game Jolt client.
   * @param options The grid manager options.
   */
  constructor(client: Client, options: GridManagerOptions) {
    super();
    this.client = client;
    this.gridUrl = options.baseUrl || "https://grid.gamejolt.com/grid/host";
    this.frontend = options.frontend;
    this.connect();
  }

  /**
   * Connects to grid.
   */
  async connect(): Promise<void> {
    // get hostname from loadbalancer first
    const hostResult = await pollRequest("Select server", () =>
      Axios.get(this.gridUrl, {
        timeout: 3000,
      })
    );
    const host = `${hostResult.data}/grid/socket`;

    this.socket = new Socket(host, {
      heartbeatIntervalMs: 30000,
    });

    // HACK
    // there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
    // this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
    // The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
    const socketAny: any = this.socket;
    // eslint-disable-next-line no-prototype-builtins
    if (socketAny.hasOwnProperty("reconnectTimer")) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      socketAny.reconnectTimer = { scheduleTimeout: () => {}, reset: () => {} };
    }
    socketAny.params = {
      gj_platform: "web",
      gj_platform_version: GJ_PLATFORM_VERSION,
    };

    await pollRequest(
      "Connect to socket",
      () =>
        new Promise((resolve: any) => {
          if (this.socket !== null) {
            this.socket.connect();
          }
          resolve();
        })
    );

    const channel = this.socket.channel("notifications:" + this.client.userId, {
      auth_token: this.frontend,
    });
    this.notificationChannel = channel;

    await pollRequest(
      "Join user notification channel",
      () =>
        new Promise((resolve: any, reject) => {
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
        })
    );

    channel.on("new-notification", (payload: NewNotificationPayload) =>
      this.handleNotification(payload)
    );

    channel.onError((reason) => {
      console.log(`[Grid] Connection error encountered (Reason: ${reason}).`);
      this.restart(0);
    });
  }

  async disconnect(): Promise<void> {
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

  async restart(sleepMs = 2_000): Promise<void> {
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
  leaveChannel(channel: Channel): void {
    channel.leave();
    if (this.socket !== null) {
      this.socket.remove(channel);
    }
  }

  private handleNotification(payload: NewNotificationPayload) {
    const data = payload.notification_data.event_item;
    const notification = new Notification(data);

    this.client.emit("user_notification", notification);
  }
}
