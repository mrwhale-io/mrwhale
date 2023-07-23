import { BotClient, BotOptions } from "@mrwhale-io/core";

import { MudgoltClient } from "./mudgolt-client";
import { database } from "../database";

export class MudgoltBotClient extends BotClient {
  readonly client: MudgoltClient;

  constructor(options: BotOptions) {
    super(options);
    this.client = new MudgoltClient();
    this.init();
  }

  /**
   * Gets the bot prefix.
   */
  getPrefix(): string | Promise<string> {
    return this.defaultPrefix;
  }

  async login(username: string): Promise<void> {
    await this.client.auth(username);
    await this.client.connect();
  }

  private async init(): Promise<void> {
    await database.init();
    database.connection.sync();
  }
}
