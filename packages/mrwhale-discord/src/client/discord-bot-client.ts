import {
  BotClient,
  FishTypeNames,
  ItemTypes,
  KeyedStorageProvider,
  ListenerDecorators,
  Mood,
  getFishById,
  getFishByName,
} from "@mrwhale-io/core";
import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  DMChannel,
  EmbedBuilder,
  Events,
  Guild,
  GuildTextBasedChannel,
  Message,
  NonThreadGuildBasedChannel,
  PartialDMChannel,
  TextBasedChannel,
} from "discord.js";
import { createDjsClient } from "discordbotlist";

import { DiscordCommandDispatcher } from "./command/discord-command-dispatcher";
import { DiscordCommand } from "./command/discord-command";
import { GuildStorageLoader } from "./storage/guild-storage-loader";
import { LevelManager } from "./managers/level-manager";
import { LoaderManager } from "./managers/loader-manager";
import { DiscordBotOptions } from "../types/discord-bot-options";
import { DiscordSelectMenu } from "./menu/discord-select-menu";
import { DiscordSelectMenuHandler } from "./menu/discord-select-menu-handler";
import { HungerManager } from "./managers/hunger-manager";
import { FishingManager } from "./managers/fishing-manager";
import { DiscordButton } from "./button/discord-button";
import { DiscordButtonHandler } from "./button/discord-button-handler";
import { UserBalanceManager } from "./managers/user-balance-manager";
import { InventoryError } from "../types/errors/inventory-error";
import { InsufficientItemsError } from "../types/errors/Insufficient-items-error";
import { HungerLevelFullError } from "../types/errors/hunger-level-full-error";
import { getFedRewardsEmbed } from "../util/embed/hunger-embed-helpers";
import { Settings } from "../types/settings";
import { GreetingsManager } from "./managers/greetings-manager";
import { getBotJoinedInfo } from "../util/embed/bot-info-helpers";
import { getFirstTextChannel } from "../util/get-first-text-channel";
import { extractUserAndGuildId } from "../util/extract-user-and-guild-id";
import { createEmbed } from "../util/embed/create-embed";
import { getUserItemsByType } from "../database/services/user-inventory";
import { checkAndAwardBalanceAchievements } from "../database/services/achievements";
import { resetUserData } from "../database/services/user";
import { ActivityHandler } from "./activity/activity-handler";
import { ActivityScheduler } from "./activity/activity-scheduler";
import { loadChannel } from "../util/load-channel";
import { FishSpawner } from "./modules/fish-spawner";
import { FishingAttemptTracker } from "./modules/fishing-attempt-tracker";
import { loadGuild } from "../util/load-guild";

const { on, once, registerListeners } = ListenerDecorators;

/**
 * Represents a Discord bot client that extends the `BotClient` class and provides additional functionality specific to Discord.
 */
export class DiscordBotClient extends BotClient<DiscordCommand> {
  /**
   * The discord client.
   */
  readonly client: Client;

  /**
   * Contains an invite link to the discord support server for the discord bot.
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
   * The directory of the bot activities.
   */
  readonly activitiesDir: string;

  /**
   * Contains discord select menus.
   */
  readonly menus: Map<string, DiscordSelectMenu>;

  /**
   * Contains the activities for the bot.
   */
  readonly activities: Map<string, ActivityHandler>;

  /**
   * Contains discord select menus.
   */
  readonly buttons: Map<string, DiscordButton>;

  /**
   * The activity scheduler for the Discord bot client.
   */
  get activityScheduler(): ActivityScheduler {
    return this._activityScheduler;
  }

  /**
   * The fish manager for the Discord bot client.
   */
  get fishingManager(): FishingManager {
    return this._fishingManager;
  }

  /**
   * The fishing attempt tracker for the Discord bot client.
   */
  get fishingAttemptTracker(): FishingAttemptTracker {
    return this._fishingAttemptTracker;
  }

  /**
   * The fish spawner for the Discord bot client.
   */
  get fishSpawner(): FishSpawner {
    return this._fishSpawner;
  }

  /**
   * Retrieves the storage settings for each guild.
   *
   * This property accesses the `guildSettings` managed by the `GuildStorageLoader`.
   * Each guild has its own unique storage settings, which are used to store and retrieve
   * configuration and state specific to that guild. This is particularly useful for
   * commands and features that require guild-specific data.
   */
  get guildSettings(): Map<string, KeyedStorageProvider> {
    return this.guildStorageLoader.guildSettings;
  }

  /**
   * The discord bot list API key.
   */
  private discordBotList?: string;

  private commandDispatcher: DiscordCommandDispatcher;
  private discordSelectMenuHandler: DiscordSelectMenuHandler;
  private discordButtonHandler: DiscordButtonHandler;

  private greetingsManager: GreetingsManager;
  private hungerManager: HungerManager;
  private levelManager: LevelManager;
  private userBalanceManager: UserBalanceManager;

  private guildStorageLoader: GuildStorageLoader;
  private loaderManager: LoaderManager;
  private _fishingManager: FishingManager;
  private _fishingAttemptTracker: FishingAttemptTracker;
  private _fishSpawner: FishSpawner;
  private _activityScheduler: ActivityScheduler;

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
    this.activitiesDir = botOptions.activitiesDir;
    this.menus = new Map<string, DiscordSelectMenu>();
    this.buttons = new Map<string, DiscordButton>();
    this.activities = new Map<string, ActivityHandler>();
    this.commandLoader.commandType = DiscordCommand.name;
    this.commandLoader.loadCommands();
    this.loaderManager = new LoaderManager(this);
    this.loaderManager.loadAll();
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
   * @param guildId The Id of the guild to get unique prefix for.
   */
  async getPrefix(guildId: string): Promise<string> {
    if (!this.guildSettings.has(guildId)) {
      return this.defaultPrefix;
    }

    const settings = this.guildSettings.get(guildId);

    return await settings.get(Settings.Prefix, this.defaultPrefix);
  }

  /**
   * Loads the settings for the specified guild.
   *
   * This method delegates the loading of guild settings to the GuildStorageLoader.
   * It ensures that the settings for the specified guild are loaded and initialized
   * into memory, making them readily accessible for the bot's operations.
   *
   * @param guildId The Id of the guild to load settings for.
   * @returns A promise that resolves once the guild settings have been loaded.
   */
  async loadGuildSettings(guildId: string): Promise<void> {
    await this.guildStorageLoader.loadGuildSettings(guildId);
  }

  /**
   * Deletes storage settings for the given guild.
   *
   * This method delegates the deletion of guild settings to the GuildStorageLoader.
   * It ensures that the settings for the specified guild are removed from both
   * the database and the in-memory storage, effectively clearing any stored data
   * related to that guild.
   *
   * @param guildId The Id of the guild to delete settings for.
   * @returns A promise that resolves once the guild settings have been deleted.
   */
  async deleteGuildSettings(guildId: string): Promise<void> {
    await this.guildStorageLoader.deleteGuildSettings(guildId);
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
    interactionOrMessage: ChatInputCommandInteraction | Message,
    fishName: FishTypeNames,
    quantity: number
  ): Promise<EmbedBuilder> {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);

    try {
      const fish = getFishByName(fishName);

      // Attempt to feed Mr. Whale with the specified fish and quantity
      const result = await this.hungerManager.feed(
        interactionOrMessage,
        fish,
        quantity
      );

      // Create an embed with the rewards details
      const rewardsEmbed = await getFedRewardsEmbed({
        fishFed: [{ fish, quantity }],
        guildId,
        userId,
        totalExpGained: result.expGained,
        totalReward: result.reward,
        botClient: this,
      });

      return rewardsEmbed;
    } catch (error) {
      if (
        error instanceof InventoryError ||
        error instanceof InsufficientItemsError ||
        error instanceof HungerLevelFullError
      ) {
        return createEmbed(error.message);
      } else {
        this.logger.error("Error feeding fish:", error);
        throw error;
      }
    }
  }

  /**
   * Feeds all fish in the user's inventory to Mr. Whale.
   * This method retrieves the user's inventory, iterates over all fish types, and feeds each type to Mr. Whale.
   * It then calculates the total experience and rewards gained, updates the user's balance, and returns an embed with the results.
   *
   * @param interactionOrMessage The Discord interaction object representing the command invocation.
   * @returns An embed with the rewards and experience gained from feeding all fish.
   */
  async feedAll(
    interactionOrMessage: ChatInputCommandInteraction | Message
  ): Promise<EmbedBuilder> {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
    const itemType: ItemTypes = "Fish";
    const inventoryItems = await getUserItemsByType(userId, guildId, itemType);

    if (!inventoryItems || inventoryItems.length === 0) {
      throw new InventoryError(itemType);
    }

    let totalExpGained = 0;
    let totalReward = 0;
    const fishFed = [];

    for (const item of inventoryItems) {
      const fish = getFishById(item.itemId);
      const quantity = item.quantity;
      try {
        const result = await this.hungerManager.feed(
          interactionOrMessage,
          fish,
          quantity
        );

        totalExpGained += result.expGained;
        totalReward += result.reward;
        fishFed.push({ fish, quantity });
      } catch (error) {
        if (error instanceof HungerLevelFullError) {
          break;
        } else {
          this.logger.error("Error feeding fish:", error);
          throw error;
        }
      }
    }

    const rewardsEmbed = await getFedRewardsEmbed({
      fishFed,
      guildId,
      userId,
      totalExpGained,
      totalReward,
      botClient: this,
    });

    return rewardsEmbed;
  }

  /**
   * Get the timestamp of the last hunger announcement for the guild.
   * @param guildId The guild to get the last announcement timestamp.
   */
  async getLastHungerAnnouncementTimestamp(guildId: string): Promise<number> {
    return this.hungerManager.getLastHungerAnnouncementTimestamp(guildId);
  }

  /**
   * Get Mr. Whale's current mood.
   * @param guildId The identifier of the guild.
   */
  async getCurrentMood(guildId: string): Promise<Mood> {
    return this.hungerManager.getCurrentMood(guildId);
  }

  /**
   * Get the timestamp of the last time Mr. Whale was fed.
   * @param guildId The guild to get the last fed timestamp.
   */
  async lastFedTimestamp(guildId: string): Promise<number> {
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
   * Add a specified amount to the user's balance in a given guild.
   *
   * This method delegates the balance update to the user balance manager,
   * ensuring that the user's balance is correctly adjusted by the specified amount.
   *
   * @param interactionOrMessage The Discord interaction object representing the command invocation.
   * @param userId The Id of the user whose balance is to be updated.
   * @param amount The amount to add to the user's balance. This can be positive or negative.
   * @returns A promise that resolves to the updated balance of the user.
   */
  async addToUserBalance(
    interactionOrMessage: ChatInputCommandInteraction | Message,
    userId: string,
    amount: number
  ): Promise<number> {
    const { guildId } = extractUserAndGuildId(interactionOrMessage);
    const { balance } = await this.userBalanceManager.addToUserBalance(
      userId,
      guildId,
      amount
    );

    await checkAndAwardBalanceAchievements(
      interactionOrMessage,
      balance,
      this.levelManager
    );

    return balance;
  }

  /**
   * Get the hunger level for the given guild.
   * @param guildId The guild to get the hunger level for.
   */
  async getGuildHungerLevel(guildId: string): Promise<number> {
    return this.hungerManager.getGuildHungerLevel(guildId);
  }

  /**
   * Checks whether the given user is owner of this bot.
   * @param userId The identifier of the user to check.
   */
  isOwner(userId: string): boolean {
    return userId === this.ownerId;
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
      Settings.AnnouncementChannel,
      defaultChannel.id
    );

    return await loadChannel(this.client, channelId, defaultChannel);
  }

  /**
   * Gets announcements for the fishing game. If an announcement is not set it will fallback to the
   * level channel and if a level channel has not been set it will fallback to the channel the message was sent in.
   * @param guildId The identifier of the guild.
   */
  async getFishingAnnouncementChannel(
    guildId: string
  ): Promise<TextBasedChannel> {
    const guild = await loadGuild(this, guildId);
    const firstChannel = getFirstTextChannel(guild) as TextBasedChannel;

    if (!this.guildSettings.has(guildId)) {
      return firstChannel;
    }

    const settings = this.guildSettings.get(guildId);
    const announcementChannelId = await settings.get(
      Settings.AnnouncementChannel
    );
    const levelupChannelId = await settings.get(Settings.LevelChannel);
    const levelupChannel = await loadChannel(
      this.client,
      levelupChannelId,
      firstChannel
    );

    if (announcementChannelId) {
      return await this.getAnnouncementChannel(guildId, levelupChannel);
    }

    return levelupChannel;
  }

  /**
   * Resets the user data for a specified user in either a specific guild or globally.
   *
   * This method clears the user's data based on the provided scope (guild-specific or global).
   * If the `isGlobal` parameter is true, it resets the user's data across all guilds and
   * removes all their balance entries from the cache. Otherwise, it resets the user's data
   * only in the specified guild and removes the balance entry from the cache for that guild.
   *
   * @param interaction The ChatInputCommandInteraction object from the Discord API, containing details of the user and guild.
   * @param isGlobal A boolean indicating whether to reset the user's data globally or just in the specific guild.
   */
  async resetUserData(
    interaction: ChatInputCommandInteraction,
    isGlobal: boolean
  ) {
    const { guildId, userId } = extractUserAndGuildId(interaction);

    if (isGlobal) {
      await resetUserData(userId);
      this.userBalanceManager.deleteUserBalances(userId);
    } else {
      await resetUserData(userId, guildId);
      this.userBalanceManager.deleteUserBalanceInGuild(userId, guildId);
    }
  }

  @once(Events.ClientReady)
  private async onClientReady(): Promise<void> {
    await this.guildStorageLoader.loadAllGuildSettings();
    if (this.discordBotList) {
      const discordBotList = createDjsClient(this.discordBotList, this.client);
      discordBotList.startPosting();
      discordBotList.postBotCommands(
        this.commands.map((cmd) => cmd.slashCommandData.toJSON())
      );
      discordBotList.startPolling();
    }
    this.initialiseHandlers();
    this.initialiseManagers();

    this._activityScheduler = new ActivityScheduler(this);
    this._activityScheduler.run();
  }

  @on(Events.GuildCreate)
  private async onGuildCreate(guild: Guild): Promise<void> {
    await this.guildStorageLoader.loadGuildSettings(guild.id);

    const channel = getFirstTextChannel(guild);
    const embed = getBotJoinedInfo(this);

    if (channel && channel.isTextBased()) {
      channel.send({ embeds: [embed] });
    }
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
      const greetingChannelId = await settings.get(Settings.GreetingChannel);
      if (greetingChannelId === channel.id) {
        settings.remove(Settings.GreetingChannel);
      }

      const levelChannelId = await settings.get(Settings.LevelChannel);
      if (levelChannelId === channel.id) {
        settings.remove(Settings.LevelChannel);
      }

      const announcementChannelId = await settings.get(
        Settings.AnnouncementChannel
      );

      if (announcementChannelId === channel.id) {
        settings.remove(Settings.AnnouncementChannel);
      }
    }
  }

  private initialiseManagers(): void {
    this.levelManager = new LevelManager(this);
    this.hungerManager = new HungerManager(this, this.levelManager);
    this._fishSpawner = new FishSpawner(this);
    this._fishingAttemptTracker = new FishingAttemptTracker();
    this._fishingManager = new FishingManager(
      this,
      this._fishSpawner,
      this._fishingAttemptTracker,
      this.levelManager
    );
    this.userBalanceManager = new UserBalanceManager();
    this.greetingsManager = new GreetingsManager(this);
  }

  private initialiseHandlers(): void {
    this.commandDispatcher = new DiscordCommandDispatcher(this);
    this.discordSelectMenuHandler = new DiscordSelectMenuHandler(this);
    this.discordButtonHandler = new DiscordButtonHandler(this);

    this.commandDispatcher.ready = true;
    this.discordSelectMenuHandler.ready = true;
    this.discordButtonHandler.ready = true;
  }
}
