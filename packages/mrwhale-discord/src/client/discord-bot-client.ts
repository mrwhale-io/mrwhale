import { BotClient, BotOptions, KeyedStorageProvider } from "@mrwhale-io/core";
import { Client, ClientOptions, User } from "discord.js";

import { DiscordCommandDispatcher } from "./command/discord-command-dispatcher";
import { DiscordCommand } from "./command/discord-command";
import { GuildStorageLoader } from "./storage/guild-storage-loader";

export class DiscordBotClient extends BotClient<DiscordCommand> {
  /**
   * The discord client.
   */
  readonly client: Client;

  /**
   * The bot command dispatcher.
   */
  readonly commandDispatcher: DiscordCommandDispatcher;

  /**
   * The guild settings.
   */
  readonly guildSettings: Map<string, KeyedStorageProvider>;

  private readonly guildStorageLoader: GuildStorageLoader;

  constructor(botOptions: BotOptions, clientOptions: ClientOptions) {
    super(botOptions);
    this.client = new Client(clientOptions);
    this.guildSettings = new Map<string, KeyedStorageProvider>();
    this.commandLoader.commandType = DiscordCommand.name;
    this.commandLoader.loadCommands();
    this.commandDispatcher = new DiscordCommandDispatcher(this);
    this.guildStorageLoader = new GuildStorageLoader(this);
    this.client.on("ready", () => {
      this.guildStorageLoader.init();
      this.guildStorageLoader.loadStorages();
    });
  }

  /**
   * Gets the room prefix.
   *
   * @param guildId The guild prefix.
   */
  async getPrefix(guildId: string): Promise<string> {
    if (!this.guildSettings.has(guildId)) {
      return this.defaultPrefix;
    }

    const settings = this.guildSettings.get(guildId);

    return await settings.get("prefix", this.defaultPrefix);
  }

  /**
   * Checks whether the given user is the bot owner.
   *
   * @param user The user to check.
   */
  isOwner(user: User): boolean {
    return user.id === this.ownerId;
  }
}
