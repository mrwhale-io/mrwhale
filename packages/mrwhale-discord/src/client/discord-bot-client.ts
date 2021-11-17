import { BotClient, BotOptions } from "@mrwhale-io/core";
import { Client, ClientOptions } from "discord.js";

import { DiscordCommandDispatcher } from "./discord-command-dispatcher";
import { DiscordCommand } from "./discord-command";

export class DiscordBotClient extends BotClient<DiscordCommand> {
  readonly client: Client;
  readonly commandDispatcher: DiscordCommandDispatcher;

  constructor(botOptions: BotOptions, clientOptions: ClientOptions) {
    super(botOptions);
    this.client = new Client(clientOptions);
    this.commandLoader.commandType = DiscordCommand.name;
    this.commandLoader.loadCommands();
    this.commandDispatcher = new DiscordCommandDispatcher(this);
  }

  getPrefix(): string {
    return "!";
  }
}
