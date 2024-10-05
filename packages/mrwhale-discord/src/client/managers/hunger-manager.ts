import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Events,
  Interaction,
  Message,
} from "discord.js";

import {
  Fish,
  HUNGRY_ANNOUNCEMENTS,
  HungerLevel,
  Mood,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { delay, getRandomDelayInMilliseconds } from "../../util/delay-helpers";
import { HungerLevelFullError } from "../../types/errors/hunger-level-full-error";
import {
  getUserItemById,
  useUserItem,
} from "../../database/services/user-inventory";
import { InventoryError } from "../../types/errors/inventory-error";
import { InsufficientItemsError } from "../../types/errors/Insufficient-items-error";
import { FeedResult } from "../../types/fishing/feed-result";
import { logFishFed } from "../../database/services/fish-fed";
import { Settings } from "../../types/settings";
import { LevelManager } from "./level-manager";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";
import { createEmbed } from "../../util/embed/create-embed";
import { drawHungerHealthBar } from "../../util/draw-hunger-health-bar";

const HUNGER_DECREASE_RATE = 1;
const FULL_HUNGER_LEVEL = 100;
const NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS = 2 * 60 * 60 * 1000; // 2 hours
const DELAY_BETWEEN_FISH_SPAWN_ANNOUNCEMENT = 5 * 60 * 1000; // 5 minutes
const DELETE_HUNGER_ANNOUNCEMENT_AFTER = 15 * 60 * 1000; // 15 minutes

interface HungerState {
  level: number;
  mood: Mood;
  lastUpdate: number;
  lastHungerAnnouncement?: number;
  lastFedTimestamp?: number;
}

interface HungerLevelMap {
  [guildId: string]: HungerState;
}

/**
 * This handles the management of Mr. Whale's hunger levels in each guild.
 *
 * Responsibilities:
 * - Maintaining the hunger levels of Mr. Whale for each guild.
 * - Tracking and updating timestamps for the last hunger announcement and the last feeding time for each guild.
 * - Providing a method to feed Mr. Whale, which increases his hunger level for the specific guild.
 * - Sending hunger announcements when Mr. Whale is hungry, based on predefined conditions.
 * - Setting Mr. Whale's current mood based on his hunger level, influencing his interactions and announcements.
 */
export class HungerManager {
  private guildHungerLevels: HungerLevelMap;

  constructor(
    private bot: DiscordBotClient,
    private levelManager: LevelManager
  ) {
    this.guildHungerLevels = {};
    this.bot.client.on(
      Events.MessageCreate,
      async (message: Message) =>
        await this.updateHungerAndSendAnnouncement(message)
    );
    this.bot.client.on(
      Events.InteractionCreate,
      async (interaction: Interaction) =>
        await this.updateHungerAndSendAnnouncement(interaction)
    );
  }

  /**
   * Retrieves the current hunger level for the specified guild.
   * @param guildId The identifier of the guild.
   * @returns The current hunger level of the guild.
   * @throws An error if the hunger state for the guild cannot be retrieved.
   */
  async getGuildHungerLevel(guildId: string): Promise<number> {
    return this.getHungerStateProperty(guildId, "level");
  }

  /**
   * Retrieves the timestamp of the last hunger announcement for the specified guild.
   * @param guildId The identifier of the guild.
   * @returns The timestamp of the last hunger announcement, or -Infinity if not available.
   */
  async getLastHungerAnnouncementTimestamp(guildId: string): Promise<number> {
    return this.getHungerStateProperty(
      guildId,
      "lastHungerAnnouncement",
      -Infinity
    );
  }

  /**
   * Retrieves Mr. Whale's current mood for the specified guild.
   * @param guildId The identifier of the guild.
   * @returns Mr. Whale's current mood, or Mood.Happy if not available.
   */
  async getCurrentMood(guildId: string): Promise<Mood> {
    return this.getHungerStateProperty(guildId, "mood", Mood.Happy);
  }

  /**
   * Retrieves the timestamp of the last time Mr. Whale was fed for the specified guild.
   * @param guildId The identifier of the guild.
   * @returns The timestamp of the last time Mr. Whale was fed.
   */
  async lastFedTimestamp(guildId: string): Promise<number> {
    return this.getHungerStateProperty(guildId, "lastFedTimestamp");
  }

  /**
   * Initialises the hunger state for a specific guild if it does not already exist.
   * This method ensures that each guild has an initial hunger state setup.
   *
   * @param guildId The identifier of the guild for which to initialize the hunger state.
   * @returns A promise that resolves when the hunger state is initialized.
   */
  async initialiseGuildHungerState(guildId: string): Promise<void> {
    if (!this.guildHungerLevels[guildId]) {
      this.guildHungerLevels[guildId] = await this.getInitialHungerState(
        guildId
      );
    }
  }

  /**
   * Feeds Mr. Whale with the specified quantity of a given fish, updating the user's inventory,
   * Mr. Whale's hunger level, and awarding the user with experience points and rewards.
   *
   * @param interactionOrMessage The interaction or message triggering the feed action.
   * @param fish The fish being fed to Mr. Whale.
   * @param quantity The quantity of the fish being fed.
   * @returns A Promise that resolves to a FeedResult containing the amount of exp gained, the reward given, and the new hunger level.
   */
  async feed(
    interactionOrMessage: Message<boolean> | ChatInputCommandInteraction,
    fish: Fish,
    quantity: number
  ): Promise<FeedResult> {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);

    // Retrieve the user's fish item from their inventory
    const usersFish = await getUserItemById(userId, guildId, fish.id, "Fish");

    // Check if the user has the fish in their inventory and if they have enough quantity
    if (!usersFish || usersFish.quantity <= 0) {
      throw new InventoryError(fish.name);
    }

    if (quantity > usersFish.quantity) {
      throw new InsufficientItemsError(fish.name, usersFish.quantity);
    }

    // Check if the guild exists in the hunger levels map
    if (!this.guildHungerLevels[guildId]) {
      throw new Error("Guild not found.");
    }

    // Calculate the new hunger level
    const currentHungerLevel = this.guildHungerLevels[guildId].level;
    const reward = fish.worth * quantity;
    const hpIncreaseAmount = fish.hpWorth * quantity;
    const expIncreaseAmount = fish.expWorth * quantity;
    const newHungerLevel = currentHungerLevel + hpIncreaseAmount; // Increase hunger level based on fish type

    if (newHungerLevel > HungerLevel.Full) {
      throw new HungerLevelFullError();
    }

    // Update the guild's hunger level and last fed timestamp
    this.guildHungerLevels[guildId].level = newHungerLevel;
    this.guildHungerLevels[guildId].lastFedTimestamp = Date.now();

    await this.persistHungerState(guildId, this.guildHungerLevels[guildId]);

    // Log the feeding action and update the user's inventory
    await logFishFed(userId, guildId, fish.id, quantity);
    await useUserItem(userId, guildId, usersFish, quantity);

    // Award EXP to the user
    await this.levelManager.increaseExp(
      interactionOrMessage,
      userId,
      guildId,
      expIncreaseAmount
    );

    // Update the user's balance and get the new balance
    await this.bot.addToUserBalance(interactionOrMessage, userId, reward);

    return {
      expGained: expIncreaseAmount,
      reward,
      hungerLevel: newHungerLevel,
    };
  }

  private async getHungerStateProperty<T>(
    guildId: string,
    property: keyof HungerState,
    defaultValue?: T
  ): Promise<T> {
    try {
      await this.initialiseGuildHungerState(guildId);

      return (this.guildHungerLevels[guildId][property] as T) ?? defaultValue;
    } catch (error) {
      this.bot.logger.error(
        `Failed to get ${property} for guild ${guildId}:`,
        error
      );
      throw new Error(`Could not retrieve ${property} for guild ${guildId}.`);
    }
  }

  private async sendHungryAnnouncement(
    interactionOrMessage: Interaction | Message
  ): Promise<void> {
    const currentTime = Date.now();
    const { guildId } = interactionOrMessage;
    const lastHungerMessage = await this.getLastHungerAnnouncementTimestamp(
      guildId
    );
    const elapsedTimeSinceHungerMessage = currentTime - lastHungerMessage;

    const fishSpawnMessage = this.bot.fishSpawner.getAnnouncementMessage(
      guildId
    );
    const fishSpawnMessageTimestamp = fishSpawnMessage
      ? fishSpawnMessage.createdTimestamp
      : -Infinity;
    const elapsedTimeSinceSpawnMessage =
      currentTime - fishSpawnMessageTimestamp;
    const areAnnouncementsEnabled = await this.areAnnouncementsEnabled(guildId);

    // Check if it's time to send a hunger announcement
    if (
      elapsedTimeSinceHungerMessage <=
        NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS ||
      elapsedTimeSinceSpawnMessage <= DELAY_BETWEEN_FISH_SPAWN_ANNOUNCEMENT ||
      !areAnnouncementsEnabled
    ) {
      return;
    }

    const hungerLevel = await this.getGuildHungerLevel(guildId);

    // Determine the appropriate announcements based on hunger level
    let announcements: string[] | undefined;
    if (hungerLevel <= HungerLevel.Starving) {
      announcements = HUNGRY_ANNOUNCEMENTS[Mood.Grumpy];
    } else if (hungerLevel <= HungerLevel.Hungry) {
      announcements = HUNGRY_ANNOUNCEMENTS[Mood.Okay];
    } else if (hungerLevel <= HungerLevel.Peckish) {
      announcements = HUNGRY_ANNOUNCEMENTS[Mood.Happy];
    }

    // Send the announcement if available
    if (announcements) {
      await this.sendRandomHungerAnnouncement(guildId, announcements);
    }
  }

  private async areAnnouncementsEnabled(guildId: string): Promise<boolean> {
    if (!this.bot.guildSettings.has(guildId)) {
      return true;
    }

    const settings = this.bot.guildSettings.get(guildId);

    return await settings.get(Settings.HungerAnnouncements, true);
  }

  private async sendRandomHungerAnnouncement(
    guildId: string,
    announcements: string[]
  ): Promise<void> {
    if (!this.guildHungerLevels[guildId]) {
      return;
    }
    // Send the announcement message to the appropriate channel.
    const currentTime = Date.now();
    this.guildHungerLevels[guildId].lastHungerAnnouncement = currentTime;

    // Generate random delay between 30 and 60 seconds (in milliseconds)
    const delayInMilliseconds = getRandomDelayInMilliseconds(30, 60);
    await delay(delayInMilliseconds);

    try {
      const announcement =
        announcements[Math.floor(Math.random() * announcements.length)];
      const announcementChannel = await this.bot.getFishingAnnouncementChannel(
        guildId
      );
      const embed = await this.getDespawnAnnouncementEmbed(
        guildId,
        announcement
      );

      const message = await announcementChannel.send({ embeds: [embed] });

      setTimeout(() => {
        if (message && message.deletable) {
          message.delete().catch(() => null);
        }
      }, DELETE_HUNGER_ANNOUNCEMENT_AFTER);
    } catch (error) {
      this.bot.logger.error("Failed to send hunger announcement:", error);
    }
  }

  private async getDespawnAnnouncementEmbed(
    guildId: string,
    announcement: string
  ): Promise<EmbedBuilder> {
    const lastFedTimestamp = await this.lastFedTimestamp(guildId);
    const lastFedString = lastFedTimestamp
      ? `<t:${Math.floor(lastFedTimestamp / 1000)}:R>`
      : "Never";
    const hungerLevel = await this.getGuildHungerLevel(guildId);
    const embed = createEmbed(announcement)
      .setTitle("Hunger Alert")
      .addFields(
        {
          name: "Satiety Level",
          value: `${drawHungerHealthBar(hungerLevel)}`,
        },
        { name: "Last Fed", value: `⏰ ${lastFedString}` }
      )
      .setFooter({
        text:
          "Use the /feed command to increase Mr. Whale's mood and satiety level.",
      })
      .setTimestamp();

    return embed;
  }

  private setCurrentMood(guildId: string, hungerLevel: number) {
    if (hungerLevel >= HungerLevel.Hungry) {
      this.guildHungerLevels[guildId].mood = Mood.Happy;
    } else if (hungerLevel >= HungerLevel.Starving) {
      this.guildHungerLevels[guildId].mood = Mood.Okay;
    } else {
      this.guildHungerLevels[guildId].mood = Mood.Grumpy;
    }
  }

  private async updateHungerAndSendAnnouncement(
    interactionOrMessage: Interaction | Message
  ): Promise<void> {
    const { guildId } = interactionOrMessage;
    if (guildId) {
      await this.calculateAndUpdateHunger(guildId);
      await this.sendHungryAnnouncement(interactionOrMessage);
    }
  }

  /**
   * Persists the current hunger state for a given guild.
   *
   * This method updates the hunger state for a specified guild by saving it to the guild's settings.
   * It ensures that the hunger state is kept up-to-date and can be retrieved later when needed.
   *
   * @param guildId The Id of the guild whose hunger state needs to be updated.
   * @param hungerState The current hunger state to be saved for the guild.
   */
  private async persistHungerState(
    guildId: string,
    hungerState: HungerState
  ): Promise<void> {
    const guildSettings = this.bot.guildSettings.get(guildId);
    if (guildSettings) {
      await guildSettings.set(Settings.HungerState, hungerState);
    } else {
      this.bot.logger.warn(`Guild settings not found for guildId: ${guildId}`);
    }
  }

  /**
   * Calculates the hunger decrease amount based on elapsed time.
   * @param elapsedTime The elapsed time in milliseconds.
   * @returns The calculated hunger decrease amount.
   */
  private calculateHungerDecrease(elapsedTime: number): number {
    return (elapsedTime / (1000 * 60)) * HUNGER_DECREASE_RATE;
  }

  /**
   * Adjusts the guild's hunger level based on the time elapsed since the last update.
   * This method ensures that the hunger level decreases over time and updates the mood accordingly.
   * If the guild does not have a hunger state, it initializes it to a default value.
   * The method also updates the last update timestamp to the current time.
   *
   * @param guildId The Id of the guild to update the hunger level for.
   * @returns A promise that resolves when the hunger level has been calculated and updated.
   */
  private async calculateAndUpdateHunger(guildId: string): Promise<void> {
    // Initialise hunger state if it doesn't exist
    await this.initialiseGuildHungerState(guildId);

    const currentTime = Date.now();
    const { lastUpdate = currentTime, level } = this.guildHungerLevels[guildId];
    const elapsedTime = currentTime - lastUpdate;

    // Calculate the decrease in hunger level
    const decreaseAmount = this.calculateHungerDecrease(elapsedTime);

    // Update the hunger level and ensure it doesn't go below 0
    this.guildHungerLevels[guildId].level = Math.max(level - decreaseAmount, 0);

    // Update the guild's mood based on the new hunger level
    this.setCurrentMood(guildId, this.guildHungerLevels[guildId].level);

    this.guildHungerLevels[guildId].lastUpdate = currentTime;

    await this.persistHungerState(guildId, this.guildHungerLevels[guildId]);
  }

  /**
   * Retrieves the initial hunger state for a guild, either from settings or default.
   * @param guildId The guild Id.
   * @returns The initial hunger state.
   */
  private async getInitialHungerState(guildId: string): Promise<HungerState> {
    const defaultHungerState: HungerState = {
      level: FULL_HUNGER_LEVEL,
      mood: Mood.Happy,
      lastUpdate: Date.now(),
    };

    await this.bot.loadGuildSettings(guildId);

    const guildSettings = this.bot.guildSettings.get(guildId);
    const storedHungerState = await guildSettings.get(
      Settings.HungerState,
      defaultHungerState
    );

    return storedHungerState || defaultHungerState;
  }
}
