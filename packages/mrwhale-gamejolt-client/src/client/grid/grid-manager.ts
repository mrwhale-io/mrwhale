import Axios, { AxiosResponse } from "axios";
import * as events from "events";
import { Socket, Channel } from "phoenix-channels";

import { Client } from "../client";
import { GridManagerOptions } from "../../types/grid-manager-options";
import { Notification } from "../../structures/notification";
import {
  Events,
  GJ_PLATFORM_VERSION,
  GRID_API_BASE_URL,
} from "../../constants";
import { ChatManager } from "../chat/chat-manager";
import { pollRequest } from "../../util/poll-request";

const AUTH_TIMEOUT = 3000;

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
 * The `GridManager` class is responsible for managing the connection to the GameJolt grid service.
 * It handles socket connections, channel subscriptions, and notification handling.
 */
export class GridManager extends events.EventEmitter {
  /**
   * Whether the grid is connected.
   */
  connected = false;

  /**
   * The socket connection.
   */
  socket: Socket | null;

  /**
   * The channels the user is connected to.
   */
  channels: Channel[] = [];

  /**
   * The notification channel.
   */
  notificationChannel: Channel;

  /**
   * The client instance used to interact with the GameJolt API.
   * This is a read-only property.
   */
  readonly client: Client;

  /**
   * A readonly instance of the ChatManager.
   * This manages chat-related functionalities within the client.
   */
  readonly chat: ChatManager;

  /**
   * The session identifier used for authentication.
   */
  private frontend: string;

  /**
   * The token used to tell Game Jolt that the client connecting is Mr. Whale.
   */
  private mrwhaleToken: string;

  /**
   * The URL of the grid service.
   */
  private gridUrl: string;

  /**
   * @param client The Game Jolt client.
   * @param options The grid manager options.
   */
  constructor(client: Client, options: GridManagerOptions) {
    super();
    this.client = client;
    this.gridUrl = options.baseUrl || GRID_API_BASE_URL;
    this.frontend = options.frontend;
    this.mrwhaleToken = options.mrwhaleToken;
    this.chat = new ChatManager(this.client, this);
    this.connect();
  }

  /**
   * Establishes a connection to the grid socket and joins the user notification channel.
   *
   * This method performs the following steps:
   * 1. Retrieves authentication details (host and token).
   * 2. Initializes a new socket connection with the retrieved host and token.
   * 3. Disables the automatic reconnection mechanism of the Phoenix socket.
   * 4. Sets up event listeners for socket open, error, and close events.
   * 5. Connects to the socket and configures the maximum received frame size.
   * 6. Joins the user notification channel and sets up event listeners for new notifications and channel errors.
   * 7. Joins the user chat channel.
   *
   * @returns A promise that resolves when the connection and channel joining process is complete.
   */
  async connect(): Promise<void> {
    // Retrieve authentication details (host and token).
    const [hostResult, tokenResult] = await this.getAuth();
    const host = `${hostResult.data}/grid/socket`;
    const token = tokenResult.data.token;

    // Initialize a new socket connection with the retrieved host and token.
    this.socket = new Socket(host, {
      heartbeatIntervalMs: 30000,
      params: {
        token,
        gj_platform: "web",
        gj_platform_version: GJ_PLATFORM_VERSION,
      },
    });

    const socketAny: any = this.socket;

    // HACK
    // there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
    // this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
    // The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
    // eslint-disable-next-line no-prototype-builtins
    if (socketAny.hasOwnProperty("reconnectTimer")) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      socketAny.reconnectTimer = { scheduleTimeout: () => {}, reset: () => {} };
    }

    // Set up event listeners for socket open, error, and close events.
    this.socket.onOpen(() => {
      this.connected = true;
    });

    this.socket.onError((err) => {
      this.client.logger.warn("[Grid] Got error from socket", err);
      this.restart();
    });

    this.socket.onClose((err) => {
      this.client.logger.warn("[Grid] Socket closed unexpectedly", err);
      this.restart();
    });

    // Connect to the socket and configure the maximum received frame size.
    await pollRequest(
      "Connect to socket",
      () =>
        new Promise((resolve: any) => {
          if (this.socket !== null) {
            this.socket.connect();
            socketAny.conn._client.config.maxReceivedFrameSize =
              64 * 1024 * 1024 * 1024;
          }
          resolve();
        }),
    );

    // Join the user notification channel
    const channel = this.socket.channel("notifications:" + this.client.userId);
    this.notificationChannel = channel;

    await pollRequest(
      "Join user notification channel",
      () =>
        new Promise((resolve: any, reject) => {
          channel
            .join()
            .receive("error", reject)
            .receive("ok", () => {
              this.channels.push(channel);
              for (const resolver of connectionResolvers) {
                resolver();
              }
              connectionResolvers = [];

              resolve();
            });
        }),
    );

    // Set up event listeners for new notifications and channel errors.
    channel.on("new-notification", (payload: NewNotificationPayload) =>
      this.handleNotification(payload),
    );

    channel.onError((reason) => {
      this.client.logger.warn(
        `[Grid] Connection error encountered (Reason: ${reason}).`,
      );
      this.restart(0);
    });

    await this.chat.joinUserChannel();
  }

  /**
   * Disconnects the client from the server.
   *
   * @returns A promise that resolves when the disconnection process is complete.
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      this.connected = false;
      this.chat.reset();
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

  /**
   * Restarts the connection after a specified delay.
   *
   * @param sleepMs The amount of time to wait before attempting to reconnect, in milliseconds. Defaults to 2000 ms.
   * @returns A promise that resolves when the restart process is complete.
   */
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

  /**
   * Retrieves authentication details (host and token) from the grid service.
   *
   * This method sends two requests to the grid service:
   * 1. A GET request to the `/host` endpoint to retrieve the host URL for the socket connection.
   * 2. A POST request to the `/token` endpoint to retrieve the authentication token for the socket connection, using the frontend identifier and user ID.
   *
   * @returns A promise that resolves to an array containing the responses from both requests: `[hostResponse, tokenResponse]`.
   * The `hostResponse` contains the host URL for the socket connection, and the `tokenResponse` contains the authentication token.
   */
  private async getAuth(): Promise<[AxiosResponse<any>, AxiosResponse<any>]> {
    const headers = { "mrwhale-token": this.mrwhaleToken };
    return await pollRequest("Auth to server", () => {
      return Promise.all([
        Axios.get(`${this.gridUrl}/host`, {
          timeout: AUTH_TIMEOUT,
          headers,
        }),
        Axios.post(
          `${this.gridUrl}/token`,
          { auth_token: this.frontend, user_id: this.client.userId },
          {
            timeout: AUTH_TIMEOUT,
            headers,
          },
        ),
      ]);
    });
  }

  private handleNotification(payload: NewNotificationPayload) {
    const data = payload.notification_data.event_item;
    const notification = new Notification(data);

    this.client.emit(Events.USER_NOTIFICATION, notification);
  }
}
