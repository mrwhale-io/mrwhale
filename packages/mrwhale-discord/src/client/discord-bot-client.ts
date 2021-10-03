import { BotClient, BotOptions } from "@mrwhale-io/core";
import { Client, ClientOptions } from "discord.js";

import { DiscordCommandDispatcher } from "./discord-command-dispatcher";
import { DiscordCommandLoader } from "./discord-command-loader";

export class DiscordBotClient extends BotClient<Client> {
  readonly commandDispatcher: DiscordCommandDispatcher;

  constructor(botOptions: BotOptions, ClientOptions: ClientOptions) {
    super(botOptions);
    this.client = new Client(ClientOptions);
    this.commandLoader = new DiscordCommandLoader(this);
    this.commandLoader.loadCommands();
    this.commandDispatcher = new DiscordCommandDispatcher(this);
  }
}
