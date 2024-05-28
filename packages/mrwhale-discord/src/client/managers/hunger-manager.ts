import { Events, Guild, Interaction, Message } from "discord.js";

import {
  Fish,
  HUNGRY_ANNOUNCEMENTS,
  HungerLevel,
  Mood,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { delay } from "../../util/delay";

const HUNGER_DECREASE_RATE = 1;
const FULL_HUNGER_LEVEL = 100;
const NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS = 30 * 60 * 1000; // 30 minutes
const DELAY_BETWEEN_FISH_SPAWN_ANNOUNCEMENT = 5 * 60 * 1000;
const DELETE_HUNGER_ANNOUNCEMENT_AFTER = 5 * 60 * 1000; // 5 minutes

interface HungerState {
  level: number;
  mood: Mood;
  lastUpdate?: number;
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

  constructor(private bot: DiscordBotClient) {
    this.guildHungerLevels = {};
    this.bot.client.on(Events.GuildAvailable, (guild: Guild) =>
      this.updateHunger(guild.id)
    );
    this.bot.client.on(Events.MessageCreate, (message: Message) =>
      this.updateHungerAndSendAnnouncement(message)
    );
    this.bot.client.on(Events.InteractionCreate, (interaction: Interaction) =>
      this.updateHungerAndSendAnnouncement(interaction)
    );
  }

  /**
   * Get the hunger level for the given guild.
   * @param guildId The guild to get the hunger level for.
   */
  getGuildHungerLevel(guildId: string): number {
    return this.guildHungerLevels[guildId].level;
  }

  /**
   * Get the timestamp of the last hunger announcement for the guild.
   * @param guildId The guild to get the last announcement timestamp.
   */
  getLastHungerAnnouncementTimestamp(guildId: string): number {
    return this.guildHungerLevels[guildId]?.lastHungerAnnouncement || -Infinity;
  }

  /**
   * Get Mr. Whale's current mood.
   * @param guildId The identifier of the guild.
   */
  getCurrentMood(guildId: string): Mood {
    return this.guildHungerLevels[guildId]?.mood || Mood.Happy;
  }

  /**
   * Get the timestamp of the last time Mr. Whale was fed.
   * @param guildId The guild to get the last fed timestamp.
   */
  lastFedTimestamp(guildId: string): number {
    return this.guildHungerLevels[guildId]?.lastFedTimestamp;
  }

  /**
   * Feeds the guild's Mr. Whale with the specified quantity of fish, updating the hunger level.
   * @param guildId The ID of the guild.
   * @param fish The fish being fed to Mr. Whale.
   * @param quantity The quantity of fish being fed.
   * @returns The new hunger level after feeding.
   */
  async feed(guildId: string, fish: Fish, quantity: number): Promise<number> {
    // Check if the guild exists in the hunger levels map
    if (!this.guildHungerLevels[guildId]) {
      throw new Error("Guild not found.");
    }

    // Calculate the new hunger level
    const currentHungerLevel = this.guildHungerLevels[guildId].level;
    const increaseAmount = fish.hpWorth * quantity;
    const newHungerLevel = currentHungerLevel + increaseAmount; // Increase hunger level based on fish type

    if (newHungerLevel > HungerLevel.Full) {
      throw new Error("I'm too full to eat this!");
    }

    // Update the guild's hunger level and last fed timestamp
    this.guildHungerLevels[guildId].level = newHungerLevel;
    this.guildHungerLevels[guildId].lastFedTimestamp = Date.now();

    return newHungerLevel;
  }

  private async sendHungryAnnouncement(
    interactionOrMessage: Interaction | Message
  ): Promise<void> {
    const currentTime = Date.now();
    const { guildId } = interactionOrMessage;
    const lastHungerMessage = this.getLastHungerAnnouncementTimestamp(guildId);
    const elapsedTimeSinceHungerMessage = currentTime - lastHungerMessage;

    const fishSpawnMessage = this.bot.getAnnouncementMessage(guildId);
    const fishSpawnMessageTimestamp = fishSpawnMessage
      ? fishSpawnMessage.createdTimestamp
      : -Infinity;
    const elapsedTimeSinceSpawnMessage =
      currentTime - fishSpawnMessageTimestamp;

    if (elapsedTimeSinceSpawnMessage <= DELAY_BETWEEN_FISH_SPAWN_ANNOUNCEMENT) {
      return;
    }

    // Check if it's time to send a hungry announcement
    if (
      elapsedTimeSinceHungerMessage <= NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS
    ) {
      return;
    }

    const hungerLevel = this.getGuildHungerLevel(guildId);

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
      await this.sendRandomHungerAnnouncement(
        interactionOrMessage,
        announcements
      );
    }
  }

  private async sendRandomHungerAnnouncement(
    interactionOrMessage: Interaction | Message,
    announcements: string[]
  ): Promise<void> {
    const { guildId } = interactionOrMessage;

    if (!this.guildHungerLevels[guildId]) {
      return;
    }
    // Send the announcement message to the appropriate channel.
    const currentTime = Date.now();
    this.guildHungerLevels[guildId].lastHungerAnnouncement = currentTime;

    // Generate random delay between 30 and 60 seconds (in milliseconds)
    const delayInMilliseconds = Math.floor(Math.random() * 31 + 30) * 1000;
    await delay(delayInMilliseconds);

    const announcement =
      announcements[Math.floor(Math.random() * announcements.length)];
    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      interactionOrMessage
    );
    const message = await announcementChannel.send(announcement);

    setTimeout(() => {
      if (message && message.deletable) {
        message.delete().catch(() => null);
      }
    }, DELETE_HUNGER_ANNOUNCEMENT_AFTER);
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

  private updateHungerAndSendAnnouncement(
    interactionOrMessage: Interaction | Message
  ) {
    const { guildId } = interactionOrMessage;
    if (guildId) {
      this.updateHunger(guildId);
      this.sendHungryAnnouncement(interactionOrMessage);
    }
  }

  /**
   * Adjusts the guilds hunger level based on the time elapsed since the last update.
   * @param guildId The guild to update the hunger level for.
   */
  private updateHunger(guildId: string): void {
    const currentTime = Date.now();
    const lastUpdateTime =
      this.guildHungerLevels[guildId]?.lastUpdate || currentTime;
    const elapsedTime = currentTime - lastUpdateTime;
    const decreaseAmount = (elapsedTime / (1000 * 60)) * HUNGER_DECREASE_RATE;

    if (this.guildHungerLevels[guildId]) {
      this.guildHungerLevels[guildId].level -= decreaseAmount;

      this.setCurrentMood(guildId, this.guildHungerLevels[guildId].level);

      if (this.guildHungerLevels[guildId].level < 0) {
        this.guildHungerLevels[guildId].level = 0;
      }
    } else {
      this.guildHungerLevels[guildId] = {
        level: FULL_HUNGER_LEVEL,
        mood: Mood.Happy,
      };
    }

    this.guildHungerLevels[guildId].lastUpdate = currentTime;
  }
}
