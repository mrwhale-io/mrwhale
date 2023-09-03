import {
  BotClient,
  KeyedStorageProvider,
  ListenerDecorators,
} from "@mrwhale-io/core";
import {
  ChannelType,
  Client,
  ClientOptions,
  EmbedBuilder,
  Events,
  Guild,
  GuildBasedChannel,
  User,
} from "discord.js";

import { DiscordCommandDispatcher } from "./command/discord-command-dispatcher";
import { DiscordCommand } from "./command/discord-command";
import { GuildStorageLoader } from "./storage/guild-storage-loader";
import { LevelManager } from "./managers/level-manager";
import { EMBED_COLOR } from "../constants";
import { DiscordBotOptions } from "../types/discord-bot-options";
import { createDjsClient } from "discordbotlist";

const { on, once, registerListeners } = ListenerDecorators;

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

  /**
   * The support server for the discord bot.
   */
  readonly discordServer: string;

  /**
   * The version of the discord bot.
   */
  readonly version: string;

  /**
   * The base url of the dashboard api.
   */
  readonly apiBaseUrl: string;

  /**
   * The client id of the OAuth2 discord client.
   */
  readonly clientId: string;

  /**
   * The client secret of the OAuth2 discord client.
   */
  readonly clientSecret: string;

  /**
   * The discord bot list API key.
   */
  private readonly discordBotList?: string;
  private readonly levelManager: LevelManager;
  private readonly guildStorageLoader: GuildStorageLoader;

  constructor(botOptions: DiscordBotOptions, clientOptions: ClientOptions) {
    super(botOptions);
    this.client = new Client(clientOptions);
    this.version = botOptions.version;
    this.discordServer = botOptions.discordServer;
    this.apiBaseUrl = botOptions.apiBaseUrl;
    this.clientId = botOptions.clientId;
    this.clientSecret = botOptions.clientSecret;
    this.guildSettings = new Map<string, KeyedStorageProvider>();
    this.commandLoader.commandType = DiscordCommand.name;
    this.commandLoader.loadCommands();
    this.levelManager = new LevelManager(this);
    this.commandDispatcher = new DiscordCommandDispatcher(this);
    this.guildStorageLoader = new GuildStorageLoader(this);
    this.guildStorageLoader.init();
    if (botOptions.discordBotList) {
      this.discordBotList = botOptions.discordBotList;
    }
    registerListeners(this.client, this);
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

  @once(Events.ClientReady)
  private async onClientReady(): Promise<void> {
    this.guildStorageLoader.loadStorages();
    if (this.discordBotList) {
      const discordBotList = createDjsClient(this.discordBotList, this.client);
      discordBotList.startPosting();
      discordBotList.postBotCommands(
        this.commands.map((cmd) => cmd.slashCommandData.toJSON())
      );
      discordBotList.startPolling();
    }
  }

  @on(Events.GuildCreate)
  private async onGuildCreate(guild: Guild): Promise<void> {
    if (!this.guildSettings.has(guild.id)) {
      const storage = new KeyedStorageProvider(
        this.guildStorageLoader.settingsProvider,
        guild.id
      );

      await storage.init();

      this.guildSettings.set(guild.id, storage);
    }

    const channel = this.getFirstTextChannel(guild);
    const avatar = this.client.user.displayAvatarURL();
    const embed = new EmbedBuilder()
      .addFields([
        {
          name: "Official Discord server",
          value: `[Join my Discord server!](${this.discordServer})`,
        },
        {
          name: "Source code",
          value: "https://github.com/mrwhale-io/mrwhale",
        },
        {
          name: "Version",
          value: this.version,
        },
        { name: "Toggle levels", value: "`/levels`", inline: true },
        {
          name: "Set level up announcement channel",
          value: "`/levelchannel`",
          inline: true,
        },
      ])
      .setColor(EMBED_COLOR)
      .setDescription(
        `Hi I'm ${this.client.user.username} a general purpose bot. Use the \`/help\` command to see my commands!`
      )
      .setThumbnail(avatar);

    if (channel && channel.isTextBased()) {
      channel.send({ embeds: [embed] });
    }
  }

  private getFirstTextChannel(guild: Guild): GuildBasedChannel {
    const channels = guild.channels.cache;
    return channels.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        c.permissionsFor(guild.members.me).has("SendMessages")
    );
  }
}
