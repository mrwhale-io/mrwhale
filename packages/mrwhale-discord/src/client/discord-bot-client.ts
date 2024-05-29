import {
  BotClient,
  FishSpawnedResult,
  FishTypeNames,
  FishingRod,
  KeyedStorageProvider,
  ListenerDecorators,
  Mood,
  getFishByName,
} from "@mrwhale-io/core";
import {
  ActionRowBuilder,
  ButtonBuilder,
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
import { Greeting } from "../types/image/greeting";
import { DiscordSelectMenu } from "./menu/discord-select-menu";
import { DiscordSelectMenuLoader } from "./menu/discord-select-menu-loader";
import { DiscordSelectMenuHandler } from "./menu/discord-select-menu-handler";
import { HungerManager } from "./managers/hunger-manager";
import { FishManager } from "./managers/fish-manager";
import { DiscordButton } from "./button/discord-button";
import { DiscordButtonLoader } from "./button/discord-button-loader";
import { DiscordButtonHandler } from "./button/discord-button-handler";
import { getEquippedFishingRod } from "../database/services/fishing-rods";
import { UserBalanceManager } from "./managers/user-balance-manager";
import { createCatchButtons } from "../util/button/catch-buttons-helpers";
import { getEquippedBait } from "../database/services/bait";
import { NoFishError } from "../types/errors/no-fish-error";
import { NoAttemptsLeftError } from "../types/errors/no-attempts-left-error";
import { RemainingAttempts } from "../types/fishing/remaining-attempts";
import { getCaughtFishEmbed } from "../util/embed/fish-caught-embed-helpers";
import { InventoryError } from "../types/errors/inventory-error";
import { InsufficientItemsError } from "../types/errors/Insufficient-items-error";
import { HungerLevelFullError } from "../types/errors/hunger-level-full-error";
import { getFedRewardsEmbed } from "../util/embed/hunger-embed-helpers";

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
   * Contains an instance of the user balance manager.
   */
  readonly userBalanceManager: UserBalanceManager;

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
    this.userBalanceManager = new UserBalanceManager();
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
   * Gets the unique bot prefix of the specified guild.
   *
   * @param guildId The id of the guild to get the prefix for.
   */
  async getPrefix(guildId: string): Promise<string> {
    if (!this.guildSettings.has(guildId)) {
      return this.defaultPrefix;
    }

    const settings = this.guildSettings.get(guildId);

    return await settings.get("prefix", this.defaultPrefix);
  }

  /**
   * Feeds Mr. Whale with the specified fish and quantity, rewards the user with EXP and gems,
   * and returns an embed with the rewards details.
   *
   * @param interactionOrMessage The interaction or message triggering the feed action.
   * @param fishName The name of the fish to feed Mr. Whale.
   * @param quantity The quantity of the fish to feed.
   * @returns A promise that resolves to an EmbedBuilder containing the rewards details.
   */
  async feed(
    interactionOrMessage: Interaction | Message,
    fishName: FishTypeNames,
    quantity: number
  ): Promise<EmbedBuilder> {
    const {
      user: { id: userId },
    } = interactionOrMessage.member;
    const { guildId } = interactionOrMessage;

    try {
      const fish = getFishByName(fishName);

      // Attempt to feed Mr. Whale with the specified fish and quantity
      const result = await this.hungerManager.feed(
        guildId,
        userId,
        fish,
        quantity
      );

      // Award EXP to the user
      this.levelManager.increaseExp(
        interactionOrMessage,
        userId,
        guildId,
        result.expGained
      );

      // Update the user's balance and get the new balance
      const { balance } = await this.userBalanceManager.addToUserBalance(
        userId,
        guildId,
        result.reward
      );

      // Create an embed with the rewards details
      const rewardsEmbed = await getFedRewardsEmbed({
        fish,
        guildId,
        userId,
        quantity,
        balance,
        result,
        botClient: this,
      });

      return rewardsEmbed;
    } catch (error) {
      if (
        error instanceof InventoryError ||
        error instanceof InsufficientItemsError ||
        error instanceof HungerLevelFullError
      ) {
        const errorEmbed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setDescription(error.message);
        return errorEmbed;
      } else {
        this.logger.error("Error feeding fish:", error);
        throw error;
      }
    }
  }

  /**
   * Returns all the fish for the given guild.
   * @param guildId The identifier of the guild.
   */
  getGuildFish(guildId: string): Record<string, FishSpawnedResult> {
    return this.fishManager.getGuildFish(guildId);
  }

  /**
   * Gets the remaining fishing attempts allowed for the user.
   */
  getRemainingFishingAttempts(
    userId: string,
    guildId: string,
    fishingRod: FishingRod
  ): RemainingAttempts {
    return this.fishManager.getRemainingAttempts(userId, guildId, fishingRod);
  }

  /**
   * Get the timestamp of the last hunger announcement for the guild.
   * @param guildId The guild to get the last announcement timestamp.
   */
  getLastHungerAnnouncementTimestamp(guildId: string): number {
    return this.hungerManager.getLastHungerAnnouncementTimestamp(guildId);
  }

  /**
   * Get the spawn announcement message from the specified guild.
   * @param guildId The Id of the guild to get the announcement message from.
   */
  getAnnouncementMessage(guildId: string): Message<boolean> {
    return this.fishManager.getAnnouncementMessage(guildId);
  }

  /**
   * Returns whether the guild has any fish.
   * @param guildId The identifier of the guild.
   */
  hasGuildFish(guildId: string): boolean {
    const guildFish = this.getGuildFish(guildId);

    return guildFish && Object.keys(guildFish).length > 0;
  }

  /**
   * Get Mr. Whale's current mood.
   * @param guildId The identifier of the guild.
   */
  getCurrentMood(guildId: string): Mood {
    return this.hungerManager.getCurrentMood(guildId);
  }

  /**
   * Get the timestamp of the last time Mr. Whale was fed.
   * @param guildId The guild to get the last fed timestamp.
   */
  lastFedTimestamp(guildId: string): number {
    return this.hungerManager.lastFedTimestamp(guildId);
  }

  /**
   * Retrieves the user's balance for a specific guild.
   *
   * @param userId The Id of the user whose balance is being retrieved.
   * @param guildId The Id of the guild where the balance is being checked.
   */
  async getUserBalance(userId: string, guildId: string): Promise<number> {
    return this.userBalanceManager.getUserBalance(userId, guildId);
  }

  /**
   * Attempts to catch a fish for the user in the specified guild, taking into account their equipped fishing rod and bait.
   * If successful, returns an embed with the details of the caught fish and any additional action buttons.
   * If unsuccessful due to specific known errors (e.g., no fish available, no remaining attempts), returns an embed with an appropriate error message.
   *
   * @param interactionOrMessage - The interaction or message object from the Discord API, containing details of the user and guild.
   * @returns A promise that resolves to an object containing the embed with the details of the caught fish or an error message, and optionally any action buttons.
   * @throws Will throw an error if an unexpected error occurs during the process.
   */
  async catchFish(
    interactionOrMessage: Interaction | Message
  ): Promise<{
    fishCaughtEmbed: EmbedBuilder;
    catchButtons?: ActionRowBuilder<ButtonBuilder>;
  }> {
    const {
      user: { id: userId },
    } = interactionOrMessage.member;
    const { guildId } = interactionOrMessage;

    try {
      const fishingRodEquipped = await getEquippedFishingRod(userId);
      const baitEquipped = await getEquippedBait(userId, guildId);
      const fishCaught = await this.fishManager.catchFish(
        guildId,
        userId,
        fishingRodEquipped,
        baitEquipped
      );
      const fishCaughtEmbed = await getCaughtFishEmbed({
        fishCaught,
        interaction: interactionOrMessage,
        fishingRodUsed: fishingRodEquipped,
        baitUsed: baitEquipped,
        botClient: this,
      });
      const catchButtons = createCatchButtons(interactionOrMessage, this);

      return { fishCaughtEmbed: fishCaughtEmbed, catchButtons: catchButtons };
    } catch (error) {
      const nothingCaughtEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
      if (
        error instanceof NoFishError ||
        error instanceof NoAttemptsLeftError
      ) {
        nothingCaughtEmbed.setDescription(`🎣 ${error.message}`);
        return {
          fishCaughtEmbed: nothingCaughtEmbed,
        };
      } else {
        this.logger.error("Error catching fish:", error);
        throw error;
      }
    }
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

      const announcementChannelId = await settings.get("announcementChannel");

      if (announcementChannelId === channel.id) {
        settings.remove("announcementChannel");
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
