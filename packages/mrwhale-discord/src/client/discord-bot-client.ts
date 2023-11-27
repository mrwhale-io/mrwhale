import {
  BotClient,
  KeyedStorageProvider,
  ListenerDecorators,
} from "@mrwhale-io/core";
import {
  ChannelType,
  Client,
  ClientOptions,
  DMChannel,
  EmbedBuilder,
  Events,
  Guild,
  GuildBasedChannel,
  GuildMember,
  NonThreadGuildBasedChannel,
  TextBasedChannel,
  User,
} from "discord.js";
import { createDjsClient } from "discordbotlist";

import { DiscordCommandDispatcher } from "./command/discord-command-dispatcher";
import { DiscordCommand } from "./command/discord-command";
import { GuildStorageLoader } from "./storage/guild-storage-loader";
import { LevelManager } from "./managers/level-manager";
import { AVATAR_OPTIONS, EMBED_COLOR, THEME } from "../constants";
import { DiscordBotOptions } from "../types/discord-bot-options";
import { Greeting } from "../image/greeting";

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
   * The url of the discord OAuth2 redirect.
   */
  readonly redirectUrl: string;

  /**
   * The url of the dashboard.
   */
  readonly proxyUrl: string;

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
    this.redirectUrl = botOptions.redirectUrl;
    this.proxyUrl = botOptions.proxyUrl;
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

  /**
   * Creates storage settings for the given guild.
   * @param guildId The guild to create settings for.
   */
  async createGuildSettings(guildId: string): Promise<void> {
    if (!this.guildSettings.has(guildId)) {
      const storage = new KeyedStorageProvider(
        this.guildStorageLoader.settingsProvider,
        guildId
      );

      await storage.init();

      this.guildSettings.set(guildId, storage);
    }
  }

  /**
   * Deletes storage settings for the given guild.
   * @param guildId The guild to delete settings for.
   */
  async deleteGuildSettings(guildId: string): Promise<void> {
    if (this.guildSettings.has(guildId)) {
      await this.guildStorageLoader.settingsProvider.remove(guildId);
      this.guildSettings.delete(guildId);
    }
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
    await this.createGuildSettings(guild.id);

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
          name: "Website",
          value: "https://www.mrwhale.io",
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

  @on(Events.GuildDelete)
  private async onGuildDelete(guild: Guild): Promise<void> {
    const guildId = guild.id;
    await this.deleteGuildSettings(guildId);
    await LevelManager.removeAllScoresForGuild(guildId);
  }

  @on(Events.ChannelDelete)
  private async onChannelDelete(
    channel: DMChannel | NonThreadGuildBasedChannel
  ): Promise<void> {
    if (channel.type !== ChannelType.GuildText) {
      return;
    }

    const settings = this.guildSettings.get(channel.guildId);
    if (settings) {
      const greetingChannelId = await settings.get("greetingChannel");
      if (greetingChannelId === channel.id) {
        settings.remove("greetingChannel");
      }

      const levelChannelId = await settings.get("levelChannel");
      if (levelChannelId === channel.id) {
        settings.remove("levelChannel");
      }
    }
  }

  @on(Events.GuildMemberAdd)
  private async onGuildMemberAdd(guildMember: GuildMember) {
    const isGreetingsEnabled = await this.isGreetingsEnabled(
      guildMember.guild.id
    );

    if (!isGreetingsEnabled) {
      return;
    }

    const greeting = await new Greeting()
      .setGuild(guildMember.guild.name)
      .setAvatarUrl(
        guildMember.displayAvatarURL(AVATAR_OPTIONS)
      )
      .setUsername(guildMember.user.username)
      .setMessage("Whalecome to {guild.name}, {user.username}!")
      .setMemberCount(guildMember.guild.memberCount)
      .setBackgroundColour(THEME.backgroundColour)
      .setMessageColour(THEME.primaryTextColour)
      .setAvatarColour(THEME.primaryTextColour)
      .setMemberCountColour(THEME.secondaryTextColour)
      .setSecondaryBackgroundColour(THEME.secondaryBackgroundColour)
      .build();
    const channel = await this.getGreetingsChannel(guildMember.guild);
    if (channel && channel.isTextBased()) {
      channel.send({ files: [greeting] });
    }
  }

  private async getGreetingsChannel(guild: Guild): Promise<TextBasedChannel> {
    const firstChannel = this.getFirstTextChannel(guild) as TextBasedChannel;

    if (!firstChannel) {
      return null;
    }

    if (!this.guildSettings.has(guild.id)) {
      return firstChannel;
    }

    const settings = this.guildSettings.get(guild.id);
    const channelId = await settings.get("greetingChannel", firstChannel.id);

    try {
      const channel = this.client.channels.cache.has(channelId)
        ? (this.client.channels.cache.get(channelId) as TextBasedChannel)
        : ((await this.client.channels.fetch(channelId)) as TextBasedChannel);

      return channel;
    } catch {
      return firstChannel;
    }
  }

  private getFirstTextChannel(guild: Guild): GuildBasedChannel {
    const channels = guild.channels.cache;
    return channels.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        c.permissionsFor(guild.members.me).has(["SendMessages", "AttachFiles"])
    );
  }

  private async isGreetingsEnabled(guildId: string): Promise<boolean> {
    if (!this.guildSettings.has(guildId)) {
      return false;
    }

    const settings = this.guildSettings.get(guildId);

    return await settings.get("greetings", false);
  }
}
