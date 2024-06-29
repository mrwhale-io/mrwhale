import {
  BotClient,
  FishSpawnedResult,
  FishTypeNames,
  FishingRod,
  ItemTypes,
  KeyedStorageProvider,
  ListenerDecorators,
  Mood,
  getFishById,
  getFishByName,
} from "@mrwhale-io/core";
import {
  ButtonInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  DMChannel,
  EmbedBuilder,
  Events,
  Guild,
  GuildTextBasedChannel,
  Interaction,
  InteractionResponse,
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
import { DiscordBotOptions } from "../types/discord-bot-options";
import { DiscordSelectMenu } from "./menu/discord-select-menu";
import { DiscordSelectMenuLoader } from "./menu/discord-select-menu-loader";
import { DiscordSelectMenuHandler } from "./menu/discord-select-menu-handler";
import { HungerManager } from "./managers/hunger-manager";
import { FishManager } from "./managers/fish-manager";
import { DiscordButton } from "./button/discord-button";
import { DiscordButtonLoader } from "./button/discord-button-loader";
import { DiscordButtonHandler } from "./button/discord-button-handler";
import { UserBalanceManager } from "./managers/user-balance-manager";
import { createCatchButtons } from "../util/button/catch-buttons-helpers";
import { NoFishError } from "../types/errors/no-fish-error";
import { NoAttemptsLeftError } from "../types/errors/no-attempts-left-error";
import { RemainingAttempts } from "../types/fishing/remaining-attempts";
import { getCaughtFishEmbed } from "../util/embed/fish-caught-embed-helpers";
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

const { on, once, registerListeners } = ListenerDecorators;

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
   * Contains discord select menus.
   */
  readonly menus: Map<string, DiscordSelectMenu>;

  /**
   * Contains discord select menus.
   */
  readonly buttons: Map<string, DiscordButton>;

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
  private fishManager: FishManager;
  private hungerManager: HungerManager;
  private levelManager: LevelManager;
  private userBalanceManager: UserBalanceManager;

  private discordSelectMenuLoader: DiscordSelectMenuLoader;
  private guildStorageLoader: GuildStorageLoader;
  private discordButtonsLoader: DiscordButtonLoader;
  private activeFishers: Set<string> = new Set();

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
    this.commandLoader.commandType = DiscordCommand.name;
    this.commandLoader.loadCommands();
    this.discordSelectMenuLoader = new DiscordSelectMenuLoader(this);
    this.discordSelectMenuLoader.loadMenus();
    this.discordButtonsLoader = new DiscordButtonLoader(this);
    this.discordButtonsLoader.loadButtons();
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
  async getLastHungerAnnouncementTimestamp(guildId: string): Promise<number> {
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
   * Initiates the fishing process for a user in a guild. If the user is already fishing,
   * it sends a message indicating that they must wait until the current fishing attempt is complete.
   * Otherwise, it proceeds with the fishing process, sends a message indicating the fishing is in progress,
   * and then handles the result of the fishing attempt.
   *
   * @param interactionOrMessage The interaction or message object from the Discord API, containing details of the user and guild.
   * @returns A promise that resolves to the sent message containing the fish caught embed and catch buttons.
   * @throws Will throw an error if an unexpected error occurs during the process.
   */
  async catchFish(
    interactionOrMessage:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | Message
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);
    let messageResponse: Message;

    const activeFisherKey = `${guildId}-${userId}`;

    // Check if the user is already in the process of fishing.
    if (this.isUserFishing(activeFisherKey)) {
      const alreadyFishingEmbed = createEmbed(
        "You are already fishing. Please wait until your current fishing attempt is complete."
      );
      return this.sendReply(interactionOrMessage, alreadyFishingEmbed, true);
    }

    // Mark the user as currently fishing
    // This is to prevent more than one fishing action to occur at the same time
    this.activeFishers.add(activeFisherKey);

    try {
      const inProgressMessage = createEmbed(
        `🎣 <@${interactionOrMessage.member.user.id}> is fishing...`
      );

      messageResponse = await this.sendReply(
        interactionOrMessage,
        inProgressMessage
      );

      const catchResult = await this.fishManager.catchFish(
        interactionOrMessage
      );

      // Generate the embed with all the caught fish details
      const fishCaughtEmbed = await getCaughtFishEmbed({
        fishCaught: catchResult.fishCaught,
        interaction: interactionOrMessage,
        fishingRodUsed: catchResult.fishingRodUsed,
        baitUsed: catchResult.baitUsed,
        achievements: catchResult.achievements,
        botClient: this,
      });
      const catchButtons = createCatchButtons(interactionOrMessage, this);

      await messageResponse.edit({
        embeds: [fishCaughtEmbed],
        components: catchButtons ? [catchButtons] : [],
      });
    } catch (error) {
      this.handleFishingError(error, messageResponse);
    } finally {
      this.activeFishers.delete(activeFisherKey);
    }
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
    const announcementChannelId = await settings.get(
      Settings.AnnouncementChannel
    );

    if (announcementChannelId) {
      return await this.getAnnouncementChannel(guildId, message.channel);
    }

    const levelupChannelId = await settings.get(
      Settings.LevelChannel,
      message.id
    );

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
    this.fishManager = new FishManager(this, this.levelManager);
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

  private isUserFishing(activeFisherKey: string): boolean {
    return this.activeFishers.has(activeFisherKey);
  }

  /**
   * Sends a reply to the interaction or message.
   * @param interactionOrMessage The interaction or message to reply to.
   * @param embed The embed to send as a reply.
   * @param ephemeral Whether the reply is ephemeral or not.
   * @returns A promise that resolves to the sent message.
   */
  private async sendReply(
    interactionOrMessage:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | Message,
    embed: EmbedBuilder,
    ephemeral: boolean = false
  ): Promise<Message<boolean>> {
    if (interactionOrMessage instanceof Message) {
      return await interactionOrMessage.reply({
        embeds: [embed],
        allowedMentions: { users: [] },
      });
    } else {
      return await interactionOrMessage.reply({
        embeds: [embed],
        allowedMentions: { users: [] },
        fetchReply: true,
        ephemeral,
      });
    }
  }

  private async handleFishingError(
    error: Error,
    messageResponse: Message
  ): Promise<void> {
    if (error instanceof NoFishError || error instanceof NoAttemptsLeftError) {
      const nothingCaughtEmbed = createEmbed(error.message);
      `🎣 ${error.message}`;
      await messageResponse.edit({
        embeds: [nothingCaughtEmbed],
      });
    } else {
      this.logger.error("Error catching fish:", error);
      throw error;
    }
  }
}
