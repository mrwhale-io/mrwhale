import {
  BotClient,
  Fish,
  FishTypeNames,
  KeyedStorageProvider,
  ListenerDecorators,
  getFishByName,
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
  GuildTextBasedChannel,
  Interaction,
  Message,
  NonThreadGuildBasedChannel,
  PartialDMChannel,
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
import { DiscordSelectMenu } from "./menu/discord-select-menu";
import { DiscordSelectMenuLoader } from "./menu/discord-select-menu-loader";
import { DiscordSelectMenuHandler } from "./menu/discord-select-menu-handler";
import { HungerManager } from "./managers/hunger-manager";
import { getOrCreatetUser } from "../util/user";
import { getUserFishByType, updateOrCreateUserFish } from "../util/fishing";
import { UserFish } from "../database/models/user-fish";
import { FeedResult } from "../types/feed-result";
import { FishManager } from "./managers/fish-manager";
import { DiscordButton } from "./button/discord-button";
import { DiscordButtonLoader } from "./button/discord-button-loader";
import { DiscordButtonHandler } from "./button/discord-button-handler";

const { on, once, registerListeners } = ListenerDecorators;

export class DiscordBotClient extends BotClient<DiscordCommand> {
  /**
   * The discord client.
   */
  readonly client: Client;

  /**
   * An instance of the bot command dispatcher.
   */
  readonly commandDispatcher: DiscordCommandDispatcher;

  /**
   * An instance of the discord select menu handler.
   */
  readonly discordSelectMenuHandler: DiscordSelectMenuHandler;

  /**
   * An instance of the discord button handler.
   */
  readonly discordButtonHandler: DiscordButtonHandler;

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
   * The directory of the discord select menus.
   */
  readonly selectMenuDir: string;

  /**
   * The directory of the discord buttons.
   */
  readonly buttonDir: string;

  /**
   * Contains discord select menus.
   */
  readonly menus: Map<string, DiscordSelectMenu>;

  /**
   * Contains discord select menus.
   */
  readonly buttons: Map<string, DiscordButton>;

  /**
   * Contains the hunger manager for Mr. Whale.
   */
  private readonly hungerManager: HungerManager;

  /**
   * Contains the fish spawning manager for Mr. Whale.
   */
  private readonly fishManager: FishManager;

  /**
   * The discord bot list API key.
   */
  private readonly discordBotList?: string;
  private readonly levelManager: LevelManager;
  private readonly guildStorageLoader: GuildStorageLoader;
  private readonly discordSelectMenuLoader: DiscordSelectMenuLoader;
  private readonly discordButtonsLoader: DiscordButtonLoader;

  constructor(botOptions: DiscordBotOptions, clientOptions: ClientOptions) {
    super(botOptions);
    this.client = new Client(clientOptions);
    this.version = botOptions.version;
    this.discordServer = botOptions.discordServer;
    this.redirectUrl = botOptions.redirectUrl;
    this.proxyUrl = botOptions.proxyUrl;
    this.clientId = botOptions.clientId;
    this.clientSecret = botOptions.clientSecret;
    this.selectMenuDir = botOptions.selectMenuDir;
    this.buttonDir = botOptions.buttonsDir;
    this.menus = new Map<string, DiscordSelectMenu>();
    this.buttons = new Map<string, DiscordButton>();
    this.guildSettings = new Map<string, KeyedStorageProvider>();
    this.commandLoader.commandType = DiscordCommand.name;
    this.commandLoader.loadCommands();
    this.discordSelectMenuLoader = new DiscordSelectMenuLoader(this);
    this.discordSelectMenuLoader.loadMenus();
    this.discordButtonsLoader = new DiscordButtonLoader(this);
    this.discordButtonsLoader.loadButtons();
    this.levelManager = new LevelManager(this);
    this.hungerManager = new HungerManager(this);
    this.fishManager = new FishManager(this);
    this.commandDispatcher = new DiscordCommandDispatcher(this);
    this.discordSelectMenuHandler = new DiscordSelectMenuHandler(this);
    this.discordButtonHandler = new DiscordButtonHandler(this);
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
   * Increases the health level for the given guild.
   * This will increase depending on the expWorth of the given fish type.
   * @param interaction The interaction or message.
   * @param fish The fish to feed Mr. Whale.
   * @param quantity The number of given fish to feed Mr. Whale.
   */
  async feed(
    interaction: Interaction | Message,
    fishType: FishTypeNames,
    quantity: number
  ): Promise<FeedResult> {
    const userId = interaction.member.user.id;
    const guildId = interaction.guildId;
    const user = await getOrCreatetUser(userId);
    const usersFish = await getUserFishByType(userId, fishType);

    if (!usersFish || usersFish.quantity <= 0) {
      throw new Error(`You have no ${fishType} in your inventory.`);
    }

    if (quantity > usersFish.quantity) {
      throw new Error(
        `You only have ${usersFish.quantity} ${fishType} in your inventory.`
      );
    }

    const fish = getFishByName(usersFish.fishName);
    const hungerLevel = await this.hungerManager.feed(guildId, fish, quantity);

    const expIncrease = fish.expWorth * quantity;
    this.levelManager.increaseExp(interaction, expIncrease);

    const reward = fish.worth * quantity;
    user.balance += reward;
    user.save();

    usersFish.quantity -= quantity;
    if (usersFish.quantity <= 0) {
      UserFish.destroy({
        where: {
          userId,
          fishName: usersFish.fishName,
        },
      });
    }

    usersFish.save();

    return {
      expGained: expIncrease,
      reward,
      newBalance: user.balance,
      hungerLevel,
    };
  }

  /**
   * Returns all the fish for the given guild.
   * @param guildId The identifier of the guild.
   */
  getGuildFish(guildId: string) {
    return this.fishManager.getGuildFish(guildId);
  }

  /**
   * Gets the remaining fishing attempts allowed for the user.
   */
  getRemainingFishingAttempts(guildId: string, userId: string): number {
    return this.fishManager.getRemainingAttempts(guildId, userId);
  }

  /**
   * Get the timestamp of the last hunger announcement for the guild.
   * @param guildId The guild to get the last announcement timestamp.
   */
  getLastHungerAnnouncementTimestamp(guildId: string): number {
    return this.hungerManager.getLastHungerAnnouncementTimestamp(guildId);
  }

  /**
   * Checks whether the user has remaining fishing attempts in the guild.
   */
  hasRemainingFishingAttempts(guildId: string, userId: string) {
    return this.fishManager.hasRemainingAttempts(guildId, userId);
  }

  /**
   * Catch a fish from the given guild.
   * @param guildId The identifier of the guild.
   * @param userId The identifier of the user.
   */
  async catchFish(guildId: string, userId: string): Promise<Fish> {
    const fishCaught = this.fishManager.catchFish(guildId, userId);

    if (fishCaught) {
      await updateOrCreateUserFish(userId, fishCaught.name);
    }

    return fishCaught;
  }

  /**
   * Get the hunger level for the given guild.
   * @param guildId The guild to get the hunger level for.
   */
  getGuildHungerLevel(guildId: string): number {
    return this.hungerManager.getGuildHungerLevel(guildId);
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

  /**
   * Get the channel used for sending bot announcements.
   * @param guildId The identifier of the guild.
   * @param defaultChannel The channel to send if the announcement channel hasn't been set.
   */
  async getAnnouncementChannel(
    guildId: string,
    defaultChannel: DMChannel | PartialDMChannel | GuildTextBasedChannel
  ): Promise<TextBasedChannel> {
    if (!this.guildSettings.has(guildId)) {
      return defaultChannel;
    }

    const settings = this.guildSettings.get(guildId);
    const channelId = await settings.get(
      "announcementChannel",
      defaultChannel.id
    );

    try {
      const channel = this.client.channels.cache.has(channelId)
        ? (this.client.channels.cache.get(channelId) as TextBasedChannel)
        : ((await this.client.channels.fetch(channelId)) as TextBasedChannel);

      return channel;
    } catch {
      return defaultChannel;
    }
  }

  /**
   * Gets announcements for the fishing game. If an announcement is not set it will fallback to the
   * level channel and if a level channel has not been set it will fallback to the channel the message was sent in.
   * @param message The message or interaction.
   */
  async getFishingAnnouncementChannel(
    message: Interaction | Message
  ): Promise<TextBasedChannel> {
    const guildId = message.guildId;
    if (!this.guildSettings.has(guildId)) {
      return message.channel;
    }

    const settings = this.guildSettings.get(guildId);
    const announcementChannelId = await settings.get("announcementChannel");

    if (announcementChannelId) {
      return await this.getAnnouncementChannel(guildId, message.channel);
    }

    const levelupChannelId = await settings.get("levelChannel", message.id);

    try {
      const channel = this.client.channels.cache.has(levelupChannelId)
        ? (this.client.channels.cache.get(levelupChannelId) as TextBasedChannel)
        : ((await this.client.channels.fetch(
            levelupChannelId
          )) as TextBasedChannel);

      return channel;
    } catch {
      return message.channel;
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
      .setAvatarUrl(guildMember.displayAvatarURL(AVATAR_OPTIONS))
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
    const channelId = await settings.get("greetingChannel");

    if (!channelId) {
      return await this.getAnnouncementChannel(guild.id, firstChannel);
    }

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
