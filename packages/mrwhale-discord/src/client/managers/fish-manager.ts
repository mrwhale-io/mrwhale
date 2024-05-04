import { Events, Interaction, Message } from "discord.js";

import {
  ALL_FISH_CAUGHT_ANNOUNCEMENTS,
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

const MAX_NUMBER_OF_FISHING_ATTEMPTS = 5;
const MIN_NUMBER_OF_FISH = 5;
const MAX_NUMBER_OF_FISH = 15;
const NEXT_SPAWN_IN_MILLISECONDS = 3.6e6; // 1 hour
const NEXT_DESPAWN_IN_MILLISECONDS = 1.2e6; // 20 minutes
const SPAWN_CHANCE_THRESHOLD = 0.3;

interface FishSpawnMap {
  [guildId: string]: {
    lastSpawn?: number;
    announcementMessage?: Message;
    fish: Record<string, FishSpawnedResult>;
  };
}

interface RemainingAttemptsMap {
  [guildId: number]: { [user: number]: number };
}

/**
 * Responsible for spawning fish in each guild.
 */
export class FishManager {
  private guildFishSpawn: FishSpawnMap;
  private remainingAttempts: RemainingAttemptsMap;

  constructor(private bot: DiscordBotClient) {
    this.guildFishSpawn = {};
    this.remainingAttempts = {};
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
   * Returns whether the guild has any  fish.
   * @param guildId The identifier of the guild.
   */
  hasGuildFish(guildId: string): boolean {
    const guildFish = this.getGuildFish(guildId);

    return guildFish && Object.keys(guildFish).length > 0;
  }

  /**
   * Get the spawn announcement message.
   * @param guildId The identifier of the guild.
   */
  getAnnouncementMessage(guildId: string): Message<boolean> {
    return this.guildFishSpawn[guildId]?.announcementMessage;
  }

  /**
   * Gets the remaining attempts allowed for the user in the given guild.
   */
  getRemainingAttempts(guildId: string, userId: string): number {
    if (this.remainingAttempts[guildId][userId] === undefined) {
      return MAX_NUMBER_OF_FISHING_ATTEMPTS;
    }

    return this.remainingAttempts[guildId][userId];
  }

  /**
   * Checks whether the user has remaining fishing attempts in the guild.
   */
  hasRemainingAttempts(guildId: string, userId: string): boolean {
    if (!this.remainingAttempts[guildId]) {
      this.remainingAttempts[guildId] = {};
    }

    const remainingAttempts = this.getRemainingAttempts(guildId, userId);

    if (this.remainingAttempts[guildId][userId] === undefined) {
      this.remainingAttempts[guildId][userId] = remainingAttempts;
    }

    return remainingAttempts > 0;
  }

  /**
   * Catch a fish from the given guild.
   * @param guildId The identifier of the guild.
   * @param userId The user that used the command.
   */
  catchFish(guildId: string, userId: string): Fish {
    const allGuildFish = this.getGuildFish(guildId);

    if (!allGuildFish) {
      return null;
    }

    if (!this.hasRemainingAttempts) {
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

    this.remainingAttempts[guildId][userId]--;

    if (!this.hasGuildFish(guildId)) {
      const announcementMessage = this.getAnnouncementMessage(guildId);
      if (announcementMessage) {
        this.despawnFish(announcementMessage, allGuildFish);
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
    const { guildId } = message;
    const canSpawnFish = this.canSpawnFish(guildId);

    if (!canSpawnFish) {
      return;
    }

    const currentTime = Date.now();
    const numberOfFish = getRandomInt(MIN_NUMBER_OF_FISH, MAX_NUMBER_OF_FISH);
    const fish = spawnFish(numberOfFish);

    try {
      this.guildFishSpawn[guildId] = { lastSpawn: currentTime, fish };
      const announcementChannel = await this.bot.getFishingAnnouncementChannel(
        message
      );
      const announementMessageText = this.getFishSpawnAnnouncementMessage(fish);
      const announcementMessage = await announcementChannel.send(
        announementMessageText
      );
      this.guildFishSpawn[guildId].announcementMessage = announcementMessage;

      setTimeout(() => {
        const guildFish = this.getGuildFish(guildId);
        this.despawnFish(message, guildFish);
      }, NEXT_DESPAWN_IN_MILLISECONDS);
    } catch (error) {
      this.bot.logger.error("Error while spawning fish:", error);
    }
  }

  private canSpawnFish(guildId: string): boolean {
    const currentTime = Date.now();
    const lastSpawn = this.guildFishSpawn[guildId]?.lastSpawn || -Infinity;
    const lastHungerAnnouncement = this.bot.getLastHungerAnnouncementTimestamp(
      guildId
    );
    const elapsedTimeSinceLastHungerMessage =
      currentTime - lastHungerAnnouncement;
    const elapsedTimeSinceLastSpawn = currentTime - lastSpawn;
    const spawnChance = Math.random();

    return (
      elapsedTimeSinceLastSpawn >= NEXT_SPAWN_IN_MILLISECONDS &&
      spawnChance < SPAWN_CHANCE_THRESHOLD &&
      elapsedTimeSinceLastHungerMessage >= 6e4
    );
  }

  private async despawnFish(
    message: Message | Interaction,
    guildFish: Record<string, FishSpawnedResult>
  ): Promise<void> {
    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      message
    );
    const guildId = message.guildId;
    const announementMessage = !guildFish
      ? this.getAllFishCaughtAnnouncementMessage()
      : this.getFishDespawnAnnouncementMessage(guildFish);

    this.deleteAnnouncementMessage(guildId);

    delete this.guildFishSpawn[guildId].fish;
    delete this.remainingAttempts[guildId];

    const despawnAnnouncement = await announcementChannel.send(
      announementMessage
    );

    setTimeout(() => {
      if (despawnAnnouncement && despawnAnnouncement.deletable) {
        despawnAnnouncement.delete().catch(() => null);
      }
    }, NEXT_DESPAWN_IN_MILLISECONDS);
  }

  private getFishSpawnAnnouncementMessage(
    fish: Record<string, FishSpawnedResult>
  ): string {
    return this.getFishAnnouncementMessage(
      fish,
      FISH_SPAWNED_ANNOUNCEMENTS,
      SHARK_SPAWNED_ANNOUNCEMENTS,
      SQUID_SPAWNED_ANNOUNCEMENTS
    );
  }

  private getFishDespawnAnnouncementMessage(
    fish: Record<string, FishSpawnedResult>
  ): string {
    return this.getFishAnnouncementMessage(
      fish,
      FISH_DESPAWNED_ANNOUNCEMENTS,
      SHARK_DESPAWNED_ANNOUNCEMENTS,
      SQUID_DESPAWNED_ANNOUNCEMENTS
    );
  }

  private getAllFishCaughtAnnouncementMessage(): string {
    return this.getRandomAnnouncement(ALL_FISH_CAUGHT_ANNOUNCEMENTS);
  }

  private getFishAnnouncementMessage(
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

  private deleteAnnouncementMessage(guildId: string): void {
    const announcementMessage = this.getAnnouncementMessage(guildId);

    if (announcementMessage) {
      if (announcementMessage.deletable) {
        announcementMessage.delete().catch(() => null);
      }
      delete this.guildFishSpawn[guildId].announcementMessage;
    }
  }

  private getRandomAnnouncement(announcements: string[]): string {
    return announcements[Math.floor(Math.random() * announcements.length)];
  }
}
