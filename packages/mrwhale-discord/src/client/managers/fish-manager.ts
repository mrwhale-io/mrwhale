import { Events, Interaction, Message, TextBasedChannel } from "discord.js";

import {
  FISH_DESPAWNED_ANNOUNCEMENTS,
  FISH_SPAWNED_ANNOUNCEMENTS,
  Fish,
  FishSpawnedResult,
  FishTypeNames,
  SHARK_DESPAWNED_ANNOUNCEMENTS,
  SHARK_SPAWNED_ANNOUNCEMENTS,
  SQUID_DESPAWNED_ANNOUNCEMENTS,
  SQUID_SPAWNED_ANNOUNCEMENTS,
  catchFish,
  getFishByName,
  getRandomInt,
  spawnFish,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";

const MIN_NUMBER_OF_FISH = 5;
const MAX_NUMBER_OF_FISH = 15;
const NEXT_SPAWN_IN_MILLISECONDS = 3.6e6; // 1 hour
const NEXT_DESPAWN_IN_MILLISECONDS = 1.2e6; // 20 minutes
const SPAWN_CHANCE_THRESHOLD = 0.3;

interface FishSpawnMap {
  [guildId: string]: {
    lastSpawn?: number;
    fish: Record<string, FishSpawnedResult>;
  };
}

/**
 * Responsible for spawning fish in each guild.
 */
export class FishManager {
  private guildFishSpawn: FishSpawnMap;

  constructor(private bot: DiscordBotClient) {
    this.guildFishSpawn = {};
    this.bot.client.on(Events.MessageCreate, (message: Message) =>
      this.spawnFish(message)
    );
    this.bot.client.on(Events.InteractionCreate, (interaction: Interaction) =>
      this.spawnFish(interaction)
    );
  }

  /**
   * Returns all the fish for the given guild.
   * @param guildId The identifier of the guild.
   */
  getGuildFish(guildId: string): Record<string, FishSpawnedResult> {
    return this.guildFishSpawn[guildId]?.fish;
  }

  /**
   * Catch a fish from the given guild.
   * @param guildId The identifier of the guild.
   */
  catchFish(guildId: string): Fish {
    const allGuildFish = this.getGuildFish(guildId);

    if (!allGuildFish) {
      return null;
    }

    const catchableFish = this.getCatchableFish(allGuildFish);
    const fishCaught = catchFish(catchableFish);

    if (fishCaught) {
      const guildFish = allGuildFish[fishCaught.name];
      if (guildFish) {
        guildFish.quantity--;

        if (guildFish.quantity <= 0) {
          delete allGuildFish[fishCaught.name];
        }
      }
    }

    return fishCaught;
  }

  private getCatchableFish(
    allGuildFish: Record<string, FishSpawnedResult>
  ): Fish[] {
    const catchableFish: Fish[] = [];

    for (const [key, value] of Object.entries(allGuildFish)) {
      const fish = getFishByName(key as FishTypeNames);
      for (let i = 0; i < value.quantity; i++) {
        catchableFish.push(fish);
      }
    }

    return catchableFish;
  }

  private async spawnFish(message: Message | Interaction): Promise<void> {
    const currentTime = Date.now();
    const { guildId } = message;
    const lastSpawn = this.guildFishSpawn[guildId]?.lastSpawn || -Infinity;
    const elapsedTime = currentTime - lastSpawn;
    const spawnChance = Math.random();

    if (
      elapsedTime >= NEXT_SPAWN_IN_MILLISECONDS &&
      spawnChance < SPAWN_CHANCE_THRESHOLD
    ) {
      const numberOfFish = getRandomInt(MIN_NUMBER_OF_FISH, MAX_NUMBER_OF_FISH);
      const fish = spawnFish(numberOfFish);

      this.guildFishSpawn[guildId] = { lastSpawn: currentTime, fish };

      try {
        const announcementChannel = await this.getAnnouncementChannel(message);
        const announementMessage = this.getFishSpawnAnnouncementMessage(fish);
        const announcement = await announcementChannel.send(announementMessage);

        setTimeout(() => {
          announcement.delete();
          this.despawnFish(message);
        }, NEXT_DESPAWN_IN_MILLISECONDS);
      } catch (error) {
        this.bot.logger.error("Error while spawning fish:", error);
      }
    }
  }

  private async despawnFish(message: Message | Interaction): Promise<void> {
    const announcementChannel = await this.getAnnouncementChannel(message);
    const guildId = message.guildId;
    const fish = this.getGuildFish(guildId);
    const announementMessage = this.getFishDespawnAnnouncementMessage(fish);

    delete this.guildFishSpawn[guildId].fish;

    const announcement = await announcementChannel.send(announementMessage);

    setTimeout(() => {
      announcement.delete();
    }, NEXT_DESPAWN_IN_MILLISECONDS);
  }

  private getFishSpawnAnnouncementMessage(
    fish: Record<string, FishSpawnedResult>
  ): string {
    return this.getAnnouncementMessage(
      fish,
      FISH_SPAWNED_ANNOUNCEMENTS,
      SHARK_SPAWNED_ANNOUNCEMENTS,
      SQUID_SPAWNED_ANNOUNCEMENTS
    );
  }

  private getFishDespawnAnnouncementMessage(
    fish: Record<string, FishSpawnedResult>
  ): string {
    return this.getAnnouncementMessage(
      fish,
      FISH_DESPAWNED_ANNOUNCEMENTS,
      SHARK_DESPAWNED_ANNOUNCEMENTS,
      SQUID_DESPAWNED_ANNOUNCEMENTS
    );
  }

  private getAnnouncementMessage(
    fish: Record<string, FishSpawnedResult>,
    announcements: string[],
    sharkAnnouncements: string[],
    squidAnnouncements: string[]
  ): string {
    const fishNames = Object.keys(fish);
    const squid = fishNames.some(
      (fishName) => fishName === "Colossal Squid" || fishName === "Giant Squid"
    );

    if (squid) {
      return this.getRandomAnnouncement(squidAnnouncements);
    }

    const shark = fishNames.includes("Shark");

    if (shark) {
      return this.getRandomAnnouncement(sharkAnnouncements);
    }

    return this.getRandomAnnouncement(announcements);
  }

  private getRandomAnnouncement(announcements: string[]): string {
    return announcements[Math.floor(Math.random() * announcements.length)];
  }

  private async getAnnouncementChannel(
    message: Interaction | Message
  ): Promise<TextBasedChannel> {
    if (!this.bot.guildSettings.has(message.guildId)) {
      return message.channel;
    }

    const settings = this.bot.guildSettings.get(message.guildId);
    const channelId = await settings.get("levelChannel", message.channel.id);

    try {
      const channel = this.bot.client.channels.cache.has(channelId)
        ? (this.bot.client.channels.cache.get(channelId) as TextBasedChannel)
        : ((await this.bot.client.channels.fetch(
            channelId
          )) as TextBasedChannel);

      return channel;
    } catch {
      return message.channel;
    }
  }
}
