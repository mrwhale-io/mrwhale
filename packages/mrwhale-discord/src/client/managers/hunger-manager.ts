import { Events, Interaction, Message, TextBasedChannel } from "discord.js";

import {
  Fish,
  HUNGRY_ANNOUNCEMENTS,
  STARVING_ANNOUNCEMENTS,
  VERY_HUNGRY_ANNOUNCEMENTS,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";

const HUNGER_DECREASE_RATE = 1;
const FULL_HUNGER_LEVEL = 100;
const NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS = 1.8e6; // 30 minutes
const DELETE_HUNGER_ANNOUNCEMENT_AFTER = 1.2e6; // 20 minutes
const ANNOUNCE_CHANCE_THRESHOLD = 0.3;

interface HungerLevel {
  level: number;
  lastUpdate?: number;
  lastHungerAnnouncement?: number;
}

interface HungerLevelMap {
  [guildId: string]: HungerLevel;
}

/**
 * Responsible for managing Mr. Whale's hunger levels for each guild.
 */
export class HungerManager {
  private guildHungerLevels: HungerLevelMap;

  constructor(private bot: DiscordBotClient) {
    this.guildHungerLevels = {};
    this.bot.client.on(Events.MessageCreate, (message: Message) => {
      this.updateHunger(message.guildId);
      this.sendHungryAnnouncement(message);
    });
    this.bot.client.on(Events.InteractionCreate, (interaction: Interaction) => {
      this.updateHunger(interaction.guildId);
      this.sendHungryAnnouncement(interaction);
    });
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
   * Increases the health level for the given guild.
   * This will increase depending on the expWorth of the given fish type.
   * @param guildId The guild to increase health for.
   * @param fish The fish to feed Mr. Whale.
   * @param quantity The number of given fish to feed Mr. Whale.
   */
  async feed(guildId: string, fish: Fish, quantity: number): Promise<number> {
    if (this.guildHungerLevels[guildId]) {
      const newLevel =
        this.guildHungerLevels[guildId].level + fish.hpWorth * quantity; // Increase hunger level based on fish type

      if (newLevel > FULL_HUNGER_LEVEL) {
        throw new Error("I'm too full to eat this!");
      }

      this.guildHungerLevels[guildId].level = newLevel;

      return newLevel;
    }
  }

  private async sendHungryAnnouncement(
    interaction: Interaction | Message
  ): Promise<void> {
    const currentTime = Date.now();
    const { guildId } = interaction;
    const lastSpawn = this.getLastHungerAnnouncementTimestamp(guildId);
    const elapsedTime = currentTime - lastSpawn;
    const announceChance = Math.random();

    if (
      elapsedTime <= NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS ||
      announceChance > ANNOUNCE_CHANCE_THRESHOLD
    ) {
      return;
    }

    const hungerLevel = this.getGuildHungerLevel(guildId);

    if (hungerLevel <= 25) {
      return this.sendRandomAnnouncement(interaction, STARVING_ANNOUNCEMENTS);
    }

    if (hungerLevel <= 50) {
      return this.sendRandomAnnouncement(
        interaction,
        VERY_HUNGRY_ANNOUNCEMENTS
      );
    }

    if (hungerLevel <= 75) {
      return this.sendRandomAnnouncement(interaction, HUNGRY_ANNOUNCEMENTS);
    }
  }

  private async sendRandomAnnouncement(
    interaction: Interaction | Message,
    announcements: string[]
  ): Promise<void> {
    const { guildId } = interaction;
    const currentTime = Date.now();

    if (this.guildHungerLevels[guildId]) {
      this.guildHungerLevels[guildId].lastHungerAnnouncement = currentTime;
    }

    const announcement =
      announcements[Math.floor(Math.random() * announcements.length)];
    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      interaction
    );
    const message = await announcementChannel.send(announcement);

    setTimeout(() => {
      message.delete();
    }, DELETE_HUNGER_ANNOUNCEMENT_AFTER);
  }

  /**
   * Adjusts the guilds hunger level based on the time elapsed.
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

      if (this.guildHungerLevels[guildId].level < 0) {
        this.guildHungerLevels[guildId].level = 0;
      }
    } else {
      this.guildHungerLevels[guildId] = { level: FULL_HUNGER_LEVEL };
    }

    this.guildHungerLevels[guildId].lastUpdate = currentTime;
  }
}
