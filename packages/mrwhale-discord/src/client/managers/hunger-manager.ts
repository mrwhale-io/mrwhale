import { Events, Interaction, Message } from "discord.js";

import { Fish } from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";

const HUNGER_DECREASE_RATE = 5;

interface HungerLevel {
  level: number;
  lastUpdate?: number;
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
    this.bot.client.on(Events.MessageCreate, (message: Message) =>
      this.updateHunger(message.guildId)
    );
    this.bot.client.on(Events.InteractionCreate, (interaction: Interaction) =>
      this.updateHunger(interaction.guildId)
    );
  }

  /**
   * Get the hunger level for the given guild.
   * @param guildId The guild to get the hunger level for.
   */
  getGuildHungerLevel(guildId: string): number {
    this.updateHunger(guildId);
    return this.guildHungerLevels[guildId].level;
  }

  /**
   * Increases the health level for the given guild.
   * This will increase depending on the expWorth of the given fish type.
   * @param guildId The guild to increase health for.
   * @param fish The fish to feed Mr. Whale.
   * @param quantity The number of given fish to feed Mr. Whale.
   */
  feed(guildId: string, fish: Fish, quantity: number): void {
    this.updateHunger(guildId);
    if (this.guildHungerLevels[guildId]) {
      this.guildHungerLevels[guildId].level += fish.expWorth * quantity; // Increase hunger level based on fish type

      if (this.guildHungerLevels[guildId].level > 100) {
        this.guildHungerLevels[guildId].level = 100;
      }
    }
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
      this.guildHungerLevels[guildId] = { level: 100 };
    }

    this.guildHungerLevels[guildId].lastUpdate = currentTime;
  }
}
