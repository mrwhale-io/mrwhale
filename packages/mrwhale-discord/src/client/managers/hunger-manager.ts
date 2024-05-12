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
const NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS = 1.8e6; // 30 minutes
const DELETE_HUNGER_ANNOUNCEMENT_AFTER = 1.2e6; // 20 minutes

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
 * Responsible for managing Mr. Whale's hunger levels for each guild.
 */
export class HungerManager {
  private guildHungerLevels: HungerLevelMap;

  constructor(private bot: DiscordBotClient) {
    this.guildHungerLevels = {};
    this.bot.client.on(Events.GuildAvailable, (guild: Guild) =>
      this.updateHunger(guild.id)
    );
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

      if (newLevel > HungerLevel.Full) {
        throw new Error("I'm too full to eat this!");
      }

      const guildHungerLevel = this.guildHungerLevels[guildId];

      guildHungerLevel.level = newLevel;
      guildHungerLevel.lastFedTimestamp = Date.now();

      return newLevel;
    }
  }

  private async sendHungryAnnouncement(
    interactionOrMessage: Interaction | Message
  ): Promise<void> {
    const currentTime = Date.now();
    const { guildId } = interactionOrMessage;
    const lastSpawn = this.getLastHungerAnnouncementTimestamp(guildId);
    const elapsedTime = currentTime - lastSpawn;

    // Check if it's time to send a hungry announcement
    if (elapsedTime <= NEXT_HUNGER_ANNOUNCEMENT_IN_MILLISECONDS) {
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
