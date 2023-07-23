import { AUTH_EVENT, PLAYER_EVENT } from "../../constants";
import { Payload } from "../../types/payload";
import { MudgoltClient } from "../mudgolt-client";
import { Handler } from "./handlers/handler";

export class EventManager {
  readonly client: MudgoltClient;
  readonly handlers: { [handler: string]: Handler };

  constructor(client: MudgoltClient) {
    this.client = client;
    this.handlers = {};
    this.register(AUTH_EVENT, "auth");
    this.register(PLAYER_EVENT, "player");
  }

  /**
   * Register a new event handler.
   * @param event The event name.
   * @param handle The event handler name.
   */
  register(event: string, handle: string): void {
    const Handler = require(`./handlers/${handle}`).default;
    this.handlers[event] = new Handler(this.client);
  }

  /**
   * Handle the network event.
   * @param data The event data.
   */
  handle(data: Payload): void {
    if (this.handlers[data.code]) {
      this.handlers[data.code].handle(data);
    }
  }
}
