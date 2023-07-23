import * as events from "events";
import * as WebSocket from "ws";

import { Player } from "../types/player";
import { EventManager } from "./events/event-manager";
import { Payload } from "../types/payload";
import { Auth } from "../database/models/auth";
import { exportRSAKey, generateRSAKeypair, importRSAKey } from "../crypto";
import { PAY_EVENT, PING_EVENT } from "../constants";

const RECONNECT_DELAY = 5000;
const HEARTBEAT = 15000;

/**
 * This manages the connection to the mudgolt server.
 */
export class MudgoltClient extends events.EventEmitter {
  player: Player;
  keys: CryptoKeyPair;
  firstTimeAuth: boolean = false;
  username: string;
  readonly eventManager: EventManager;

  private websocket: WebSocket;
  private reconnectAttempts: number = 0;

  constructor() {
    super();
    this.eventManager = new EventManager(this);
  }

  /**
   * Opens the websocket connection to the mudgolt server.
   */
  async connect(): Promise<void> {
    const authSettings = await Auth.findOne();

    this.websocket = new WebSocket(
      `wss://mudgolt.com/ws?public-key=${encodeURIComponent(
        authSettings ? authSettings.publicKey : ""
      )}`
    );

    this.reconnectAttempts++;

    this.websocket.on("open", () => {
      this.reconnectAttempts = 0;
      setInterval(() => {
        this.sendEvent(PING_EVENT, this.player);
      }, HEARTBEAT);
      this.sendEvent(PAY_EVENT, this.player?.id);
    });

    this.websocket.on("message", (event: string) => {
      const payload = JSON.parse(event) as Payload;
      this.processMessage(payload);
    });

    this.websocket.on("close", () => {
      if (this.reconnectAttempts === 0) {
        this.connect();
      } else {
        setTimeout(() => {
          this.connect();
        }, RECONNECT_DELAY);
      }
    });
  }

  /**
   * Authorises the bot on mudgolt.
   * This will generate and store the public and private keys.
   * @param username The username of the bot.
   */
  async auth(username: string): Promise<void> {
    try {
      let authSettings = await Auth.findOne();
      if (!authSettings) {
        const generatedKeys = await generateRSAKeypair();
        const privateKey = await exportRSAKey(
          generatedKeys.privateKey,
          "pkcs8"
        );
        const publicKey = await exportRSAKey(generatedKeys.publicKey, "spki");

        authSettings = Auth.build({
          privateKey,
          publicKey,
        });
        authSettings.save();
        this.firstTimeAuth = true;
        this.username = username;
      }

      this.keys = {
        privateKey: await importRSAKey(authSettings.privateKey, "pkcs8", [
          "sign",
        ]),
        publicKey: await importRSAKey(authSettings.publicKey, "spki", [
          "verify",
        ]),
      };
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Send an event to the mudgolt server.
   * @param code The name of the event.
   * @param payload The data sent with the event.
   */
  async sendEvent<T>(code: string, payload: T) {
    this.websocket.send(
      JSON.stringify({
        code,
        payload,
      })
    );
  }

  private processMessage(msg: Payload) {
    return this.eventManager.handle(msg);
  }
}
