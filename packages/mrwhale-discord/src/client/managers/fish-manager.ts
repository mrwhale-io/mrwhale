import { Events, Interaction, Message } from "discord.js";

import {
  ALL_FISH_CAUGHT_ANNOUNCEMENTS,
  Bait,
  FISH_DESPAWNED_ANNOUNCEMENTS,
  FISH_SPAWNED_ANNOUNCEMENTS,
  Fish,
  FishSpawnedResult,
  FishTypeNames,
  FishingRod,
  Mood,
  SHARK_DESPAWNED_ANNOUNCEMENTS,
  SHARK_SPAWNED_ANNOUNCEMENTS,
  SQUID_DESPAWNED_ANNOUNCEMENTS,
  SQUID_SPAWNED_ANNOUNCEMENTS,
  catchFish,
  getFishByName,
  getFishingRodById,
  spawnFish,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { delay } from "../../util/delay";
import { getActiveUsers } from "../../util/get-active-users";
import { getplayerFishingRods } from "../../database/services/fishing-rods";
import { updateOrCreateUserItem } from "../../database/services/user-inventory";
import { logFishCaught } from "../../database/services/fish-caught";
import { NoFishError } from "../../types/errors/no-fish-error";
import { NoAttemptsLeftError } from "../../types/errors/no-attempts-left-error";
import { RemainingAttempts } from "../../types/fishing/remaining-attempts";

const ATTEMPT_REGEN_INTERVAL = 60 * 60 * 1000; // 1 hour
const NEXT_SPAWN_IN_MILLISECONDS = 2.7e6; // 45 minutes
const NEXT_DESPAWN_IN_MILLISECONDS = 1.2e6; // 20 minutes
const BASE_NO_CATCH_PROBABILITY = 200;
const FISH_PER_ACTIVE_USER = 5;

interface FishSpawnMap {
  [guildId: string]: {
    lastSpawn?: number;
    announcementMessage?: Message;
    fish: Record<string, FishSpawnedResult>;
  };
}

interface AnnouncementOptions {
  fishAnnouncements: string[];
  sharkAnnouncements: string[];
  squidAnnouncements: string[];
}

/**
 * This handles the core functionality of the fishing game.
 *
 * Responsibilities:
 * - Spawning new fish in each guild based on the number of active users and the most commonly used fishing rod.
 * - Despawning old fish after a certain period.
 * - Tracking and maintaining the timestamp of the last fish spawn and the last announcement made in each guild.
 * - Managing the remaining attempts each player has to catch fish.
 */
export class FishManager {
  private guildFishSpawn: FishSpawnMap;
  private remainingAttempts: Record<string, RemainingAttempts>;

  constructor(private bot: DiscordBotClient) {
    this.guildFishSpawn = {};
    this.remainingAttempts = {};
    this.bot.client.on(Events.MessageCreate, (message: Message) =>
      this.spawnFish(message)
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
   * Gets the remaining fishing attempts allowed for the user in the given guild.
   */
  getRemainingAttempts(
    userId: string,
    fishingRod: FishingRod
  ): RemainingAttempts {
    if (!this.remainingAttempts[userId]) {
      this.remainingAttempts[userId] = {
        lastAttemptTimestamp: Date.now(),
        attempts: fishingRod.casts,
      };
    }

    return this.remainingAttempts[userId];
  }

  /**
   * Checks whether the user has remaining fishing attempts in the guild.
   */
  hasRemainingAttempts(userId: string, fishingRod: FishingRod): boolean {
    const remainingAttempts = this.regenerateFishingAttempts(
      userId,
      fishingRod
    );

    return remainingAttempts.attempts > 0;
  }

  /**
   * Attempts to catch a fish for the specified user in the given guild using the provided fishing rod and bait.
   * Throws specific errors if no fish are available to catch or if the user has no remaining attempts.
   * If successful, returns the caught fish. If no fish is caught, decrements the user's remaining attempts.
   *
   * @param guildId The identifier of the guild where the fishing attempt is taking place.
   * @param userId The identifier of the user attempting to catch a fish.
   * @param fishingRod The fishing rod being used by the user.
   * @param bait The bait being used by the user.
   * @returns A promise that resolves to the caught Fish object, or null if no fish is caught.
   * @throws NoFishError if there are no fish available to catch in the guild.
   * @throws NoAttemptsLeftError if the user has no remaining attempts to catch fish.
   */
  async catchFish(
    guildId: string,
    userId: string,
    fishingRod: FishingRod,
    bait: Bait
  ): Promise<Fish> {
    // Check if there are any fish available to catch in the guild
    if (!this.hasGuildFish(guildId)) {
      throw new NoFishError();
    }

    // Check if the user has any remaining attempts to catch fish
    if (!this.hasRemainingAttempts(userId, fishingRod)) {
      throw new NoAttemptsLeftError();
    }

    const allGuildFish = this.getGuildFish(guildId);
    const catchableFish = this.getCatchableFish(allGuildFish);
    const fishCaught = catchFish(
      catchableFish,
      fishingRod,
      bait,
      BASE_NO_CATCH_PROBABILITY
    );

    if (!fishCaught) {
      this.updateAttempts(userId);
      return null;
    }

    // Handle the caught fish (e.g., add to inventory, update guild state)
    await this.handleFishCaught(guildId, userId, fishCaught, allGuildFish);

    return fishCaught;
  }

  private async handleFishCaught(
    guildId: string,
    userId: string,
    fishCaught: Fish,
    allGuildFish: Record<string, any>
  ): Promise<void> {
    const guildFish = allGuildFish[fishCaught.name];
    if (guildFish) {
      guildFish.quantity--;
      if (guildFish.quantity <= 0) {
        delete allGuildFish[fishCaught.name];
      }
    }

    await updateOrCreateUserItem(userId, fishCaught.id, "Fish");
    await logFishCaught(userId, guildId);
    this.updateAttempts(userId);

    if (!this.hasGuildFish(guildId)) {
      const announcementMessage = this.getAnnouncementMessage(guildId);
      if (announcementMessage) {
        this.despawnFish(announcementMessage, allGuildFish);
      }
    }
  }

  private updateAttempts(userId: string): void {
    if (this.remainingAttempts[userId]) {
      this.remainingAttempts[userId].attempts--;
      this.remainingAttempts[userId].lastAttemptTimestamp = Date.now();
    }
  }

  private regenerateFishingAttempts(
    userId: string,
    fishingRod: FishingRod
  ): RemainingAttempts {
    const remainingAttempts = this.getRemainingAttempts(userId, fishingRod);
    const now = Date.now();
    const timeSinceLastAttempt = now - remainingAttempts.lastAttemptTimestamp;
    const attemptsToRegen = Math.floor(
      timeSinceLastAttempt / ATTEMPT_REGEN_INTERVAL
    );

    remainingAttempts.attempts = Math.min(
      remainingAttempts.attempts + attemptsToRegen,
      fishingRod.casts
    );

    return remainingAttempts;
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

  private async spawnFish(message: Message): Promise<void> {
    try {
      if (!message.guild || message.author.bot) {
        return;
      }
  
      const { guildId } = message;
      const canSpawnFish = this.canSpawnFish(guildId);
      if (!canSpawnFish) {
        return;
      }

      const currentTime = Date.now();
      this.guildFishSpawn[guildId] = { lastSpawn: currentTime, fish: {} };

      const delayInMilliseconds = Math.floor(Math.random() * 31 + 30) * 1000;
      await delay(delayInMilliseconds);

      const fish = await this.generateFish(message);
      await this.generateFishSpawnNotification(message, fish);

      setTimeout(() => {
        const guildFish = this.getGuildFish(guildId);
        this.despawnFish(message, guildFish);
      }, NEXT_DESPAWN_IN_MILLISECONDS);
    } catch (error) {
      this.bot.logger.error("Error while spawning fish:", error);
    }
  }

  private async generateFishSpawnNotification(
    messageOrInteraction: Message | Interaction,
    fish: Record<string, FishSpawnedResult>
  ): Promise<void> {
    const { guildId } = messageOrInteraction;

    if (!this.hasGuildFish(guildId)) {
      return;
    }

    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      messageOrInteraction
    );
    const currentMood = this.bot.getCurrentMood(guildId);
    const announementMessageText = this.getFishSpawnAnnouncementMessage(
      currentMood,
      fish
    );
    const announcementMessage = await announcementChannel.send(
      announementMessageText
    );

    this.guildFishSpawn[guildId].announcementMessage = announcementMessage;
  }

  private async generateFish(
    message: Message
  ): Promise<Record<string, FishSpawnedResult>> {
    let generatedFish: Record<string, FishSpawnedResult> = {};
    try {
      const { guild } = message;
      const activeUsers = await getActiveUsers(message.guild);
      const activeUsersIds = activeUsers
        ? Array.from(activeUsers)
        : [message.author.id];
      // Ensure there's at least one active user to calculate fish count
      const activeUserCount =
        activeUsersIds.length > 0 ? activeUsersIds.length : 1;

      // Get the fishing rods being used among active users.
      const playerFishingRodIds = await getplayerFishingRods(activeUsersIds);

      // Get the best fishing rod being used.
      const bestFishingRodId = Math.max(...playerFishingRodIds) || 1;
      const bestFishingRod = getFishingRodById(bestFishingRodId);

      // Calculate the number of fish to spawn based on active users
      const fishCount = activeUserCount * FISH_PER_ACTIVE_USER;

      // Spawn fish based on the most used fishing rod's max catchable rarity
      generatedFish = spawnFish(fishCount, bestFishingRod.maxCatchableRarity);

      // Update the guild's fish spawn data if fish were successfully spawned
      this.guildFishSpawn[guild.id].fish = generatedFish;
    } catch (error) {
      this.bot.logger.error("Error generating fish:", error);
    }

    return generatedFish;
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

    return (
      elapsedTimeSinceLastSpawn >= NEXT_SPAWN_IN_MILLISECONDS &&
      elapsedTimeSinceLastHungerMessage >= 6e4
    );
  }

  private async despawnFish(
    message: Message,
    guildFish: Record<string, FishSpawnedResult>
  ): Promise<void> {
    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      message
    );
    const guildId = message.guildId;
    const currentMood = this.bot.getCurrentMood(guildId);
    const announementMessage = !guildFish
      ? this.getAllFishCaughtAnnouncementMessage()
      : this.getFishDespawnAnnouncementMessage(currentMood, guildFish);

    this.deleteAnnouncementMessage(guildId);

    delete this.guildFishSpawn[guildId].fish;

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
    currentMood: Mood,
    fish: Record<string, FishSpawnedResult>
  ): string {
    return this.getFishAnnouncementMessage(currentMood, fish, {
      fishAnnouncements: FISH_SPAWNED_ANNOUNCEMENTS[currentMood],
      sharkAnnouncements: SHARK_SPAWNED_ANNOUNCEMENTS,
      squidAnnouncements: SQUID_SPAWNED_ANNOUNCEMENTS,
    });
  }

  private getFishDespawnAnnouncementMessage(
    currentMood: Mood,
    fish: Record<string, FishSpawnedResult>
  ): string {
    return this.getFishAnnouncementMessage(currentMood, fish, {
      fishAnnouncements: FISH_DESPAWNED_ANNOUNCEMENTS[currentMood],
      sharkAnnouncements: SHARK_DESPAWNED_ANNOUNCEMENTS,
      squidAnnouncements: SQUID_DESPAWNED_ANNOUNCEMENTS,
    });
  }

  private getAllFishCaughtAnnouncementMessage(): string {
    return this.getRandomAnnouncement(ALL_FISH_CAUGHT_ANNOUNCEMENTS);
  }

  private getFishAnnouncementMessage(
    currentMood: Mood,
    fish: Record<string, FishSpawnedResult>,
    announcements: AnnouncementOptions
  ): string {
    const fishNames = Object.keys(fish);

    if (currentMood === Mood.Grumpy) {
      return this.getRandomAnnouncement(announcements.fishAnnouncements);
    }

    if (
      fishNames.includes("Colossal Squid") ||
      fishNames.includes("Giant Squid")
    ) {
      return this.getRandomAnnouncement(announcements.squidAnnouncements);
    }

    if (fishNames.includes("Shark")) {
      return this.getRandomAnnouncement(announcements.sharkAnnouncements);
    }

    return this.getRandomAnnouncement(announcements.fishAnnouncements);
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
