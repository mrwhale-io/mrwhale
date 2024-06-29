import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Events,
  Interaction,
  Message,
} from "discord.js";

import {
  ALL_FISH_CAUGHT_ANNOUNCEMENTS,
  Achievement,
  Bait,
  FISH_DESPAWNED_ANNOUNCEMENTS,
  FISH_RARITY_ICONS,
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
  countFishByRarity,
  getFishByName,
  getFishingRodById,
  spawnFish,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { delay, getRandomDelayInMilliseconds } from "../../util/delay-helpers";
import { getActiveUsers } from "../../util/get-active-users";
import {
  getEquippedFishingRod,
  getUniqueFishingRodIds,
} from "../../database/services/fishing-rods";
import { updateOrCreateUserItem } from "../../database/services/user-inventory";
import { logFishCaught } from "../../database/services/fish-caught";
import { NoFishError } from "../../types/errors/no-fish-error";
import { NoAttemptsLeftError } from "../../types/errors/no-attempts-left-error";
import { RemainingAttempts } from "../../types/fishing/remaining-attempts";
import { consumeBait, getEquippedBait } from "../../database/services/bait";
import { checkAndAwardFishingAchievements } from "../../database/services/achievements";
import { CatchResult } from "../../types/fishing/catch-result";
import { EMBED_COLOR } from "../../constants";
import { LevelManager } from "./level-manager";
import { extractUserAndGuildId } from "../../util/extract-user-and-guild-id";
import { Settings } from "../../types/settings";
import { createEmbed } from "../../util/embed/create-embed";

const ATTEMPT_REGEN_INTERVAL = 15 * 60 * 1000; // 15 minutes
const NEXT_SPAWN_IN_MILLISECONDS = 60 * 60 * 1000; // 1 hour
const NEXT_DESPAWN_IN_MILLISECONDS = 30 * 60 * 1000; // 30 minutes
const DELETE_ANNOUNCEMENT_AFTER = 5 * 60 * 1000; // 5 minutes
const DELAY_BETWEEN_HUNGER_ANNOUNCEMENT = 5 * 60 * 1000; // 5 minutes
const BASE_NO_CATCH_PROBABILITY = 200;
const FISH_PER_ACTIVE_USER = 5;

interface FishSpawnMap {
  [guildId: string]: {
    lastSpawn?: number;
    announcementMessage?: Message;
    despawnTimeout?: NodeJS.Timeout;
    nextDespawnTimestamp?: number;
    fish: Record<string, FishSpawnedResult>;
  };
}

interface RemainingAttemptsMap {
  [guildId: number]: { [user: number]: RemainingAttempts };
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
  private remainingAttempts: RemainingAttemptsMap;

  constructor(
    private bot: DiscordBotClient,
    private levelManager: LevelManager
  ) {
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
   * Gets the remaining fishing attempts allowed for the user in the given guild.
   */
  getRemainingAttempts(
    userId: string,
    guildId: string,
    fishingRod: FishingRod
  ): RemainingAttempts {
    if (!this.remainingAttempts[guildId]) {
      this.remainingAttempts[guildId] = {};
    }

    if (!this.remainingAttempts[guildId][userId]) {
      this.remainingAttempts[guildId][userId] = {
        lastAttemptTimestamp: Date.now(),
        attempts: fishingRod.casts,
      };
    }

    return this.remainingAttempts[guildId][userId];
  }

  /**
   * Checks whether the user has remaining fishing attempts in the guild.
   */
  hasRemainingAttempts(
    userId: string,
    guildId: string,
    fishingRod: FishingRod
  ): boolean {
    const remainingAttempts = this.regenerateFishingAttempts(
      userId,
      guildId,
      fishingRod
    );

    return remainingAttempts.attempts > 0;
  }

  /**
   * Attempts to catch a fish for the user in the specified guild.
   * Performs necessary checks, handles bait consumption, applies a delay based on the fishing rod,
   * updates the user's attempts, handles the caught fish, and awards any achievements.
   *
   * @param interactionOrMessage The interaction or message object from the Discord API, containing details of the user and guild.
   * @returns A promise that resolves to the caught Fish object, or null if no fish is caught.
   * @throws NoFishError if there are no fish available to catch in the guild.
   * @throws NoAttemptsLeftError if the user has no remaining attempts to catch fish.
   */
  async catchFish(
    interactionOrMessage:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | Message
  ): Promise<CatchResult> {
    const { userId, guildId } = extractUserAndGuildId(interactionOrMessage);

    // Check if there are any fish available to catch in the guild
    if (!this.hasGuildFish(guildId)) {
      throw new NoFishError();
    }

    const fishingRodEquipped = await getEquippedFishingRod(userId, guildId);

    // Check if the user has any remaining attempts to catch fish
    if (!this.hasRemainingAttempts(userId, guildId, fishingRodEquipped)) {
      throw new NoAttemptsLeftError();
    }

    const baitEquipped = await getEquippedBait(userId, guildId);
    const fishCaught = await this.attemptFishCatch(
      userId,
      guildId,
      fishingRodEquipped,
      baitEquipped
    );

    if (!fishCaught) {
      this.updateAttempts(userId, guildId);
      return this.createCatchResult(null, [], baitEquipped, fishingRodEquipped);
    }

    // Handle the caught fish (e.g., add to inventory, update guild state)
    await this.handleFishCaught(guildId, userId, fishCaught);

    // Check whether the user has earned any achievements
    const achievements = await checkAndAwardFishingAchievements(
      interactionOrMessage,
      fishCaught,
      this.levelManager
    );

    return this.createCatchResult(
      fishCaught,
      achievements,
      baitEquipped,
      fishingRodEquipped
    );
  }

  private async attemptFishCatch(
    userId: string,
    guildId: string,
    fishingRod: FishingRod,
    bait: Bait
  ): Promise<Fish> {
    const allGuildFish = this.getGuildFish(guildId);
    const catchableFish = this.getCatchableFish(allGuildFish);
    const fishCaught = catchFish(
      catchableFish,
      fishingRod,
      bait,
      BASE_NO_CATCH_PROBABILITY
    );

    // Use bait equipped from the user's inventory.
    await consumeBait(userId, guildId, bait.id);

    // Wait for the delay specified by the fishing rod
    await delay(fishingRod.delay);

    return fishCaught;
  }

  private async handleFishCaught(
    guildId: string,
    userId: string,
    fishCaught: Fish
  ): Promise<void> {
    // Find the type of fish caught in the guild and decrement it's quantity.
    // When the quantity is zero we delete the fish from the guild.
    const allGuildFish = this.getGuildFish(guildId);
    const guildFish = allGuildFish[fishCaught.name];
    if (guildFish) {
      guildFish.quantity--;
      if (guildFish.quantity <= 0) {
        delete allGuildFish[fishCaught.name];
      }
    }

    // Add this fish to the user's inventory.
    await updateOrCreateUserItem({
      userId,
      guildId,
      itemId: fishCaught.id,
      itemType: "Fish",
    });

    await logFishCaught(userId, guildId, fishCaught.id, fishCaught.rarity);

    // Decrement the number of attempts the user has left.
    this.updateAttempts(userId, guildId);

    // If we have caught all the fish in the guild we send an announcement
    if (!this.hasGuildFish(guildId)) {
      const announcementMessage = this.getAnnouncementMessage(guildId);
      if (announcementMessage) {
        this.despawnFish(announcementMessage, allGuildFish);
      }
    }
  }

  private updateAttempts(userId: string, guildId: string): void {
    if (this.remainingAttempts[guildId][userId]) {
      this.remainingAttempts[guildId][userId].attempts--;
      this.remainingAttempts[guildId][userId].lastAttemptTimestamp = Date.now();
    }
  }

  private regenerateFishingAttempts(
    userId: string,
    guildId: string,
    fishingRod: FishingRod
  ): RemainingAttempts {
    const remainingAttempts = this.getRemainingAttempts(
      userId,
      guildId,
      fishingRod
    );
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

  /**
   * Spawns fish in a guild if certain conditions are met.
   * This method ensures that fish are only spawned in active guilds and non-bot users.
   * It also handles fish spawn notification and scheduling fish despawn.
   *
   * @param messageOrInteraction The message or interaction that triggered the fish spawn.
   */
  private async spawnFish(
    messageOrInteraction: Message | Interaction
  ): Promise<void> {
    try {
      // Check if the interaction is invalid (not from a guild, from a bot user, etc.)
      if (this.isInvalidInteraction(messageOrInteraction)) {
        return;
      }

      const { guildId } = messageOrInteraction;

      // Check if fish can spawn in the guild
      const canSpawnFish = await this.canSpawnFish(guildId);
      if (!canSpawnFish) {
        return;
      }

      const currentTime = Date.now();
      this.guildFishSpawn[guildId] = { lastSpawn: currentTime, fish: {} };

      // Generate random delay between 120 and 180 seconds (in milliseconds)
      const delayInMilliseconds = getRandomDelayInMilliseconds(120, 180);
      await delay(delayInMilliseconds);

      const fish = await this.generateFish(messageOrInteraction);

      // Schedule the fish to despawn after a specified time
      this.scheduleFishDespawn(messageOrInteraction, guildId);

      // Send a notification about the fish spawn
      this.generateFishSpawnNotification(messageOrInteraction, fish);
    } catch (error) {
      this.bot.logger.error("Error while spawning fish:", error);
    }
  }

  private isInvalidInteraction(
    messageOrInteraction: Message | Interaction
  ): boolean {
    return (
      !messageOrInteraction.guild ||
      !messageOrInteraction.member ||
      !messageOrInteraction.member.user ||
      messageOrInteraction.member.user.bot
    );
  }

  /**
   * Schedules the fish to despawn after a specified time.
   *
   * @param messageOrInteraction The message or interaction that triggered the fish spawn.
   * @param guildId The Id of the guild where the fish will despawn.
   */
  private scheduleFishDespawn(
    messageOrInteraction: Message | Interaction,
    guildId: string
  ): void {
    const despawnTimeout = setTimeout(() => {
      const guildFish = this.getGuildFish(guildId);
      this.despawnFish(messageOrInteraction, guildFish);
    }, NEXT_DESPAWN_IN_MILLISECONDS);
    this.guildFishSpawn[guildId].despawnTimeout = despawnTimeout;
    this.guildFishSpawn[guildId].nextDespawnTimestamp =
      Date.now() + NEXT_DESPAWN_IN_MILLISECONDS;
  }

  /**
   * Generates and sends a fish spawn notification in a guild.
   *
   * @param messageOrInteraction The message or interaction that triggered the fish spawn.
   * @param fish The spawned fish details.
   */
  private async generateFishSpawnNotification(
    messageOrInteraction: Message | Interaction,
    fish: Record<string, FishSpawnedResult>
  ): Promise<void> {
    const { guildId } = messageOrInteraction;
    const areAnnouncementsEnabled = await this.areAnnouncementsEnabled(guildId);

    // Check if any fish have spawned in the guild before sending an announcement
    if (!this.hasGuildFish(guildId) || !areAnnouncementsEnabled) {
      return;
    }

    // Get the configured guild channel for fish spawn announcements
    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      messageOrInteraction
    );

    // Generate the embed containing the spawn information
    const spawnEmbed = await this.getSpawnEmbedAnnouncement(guildId, fish);
    const announcementMessage = await announcementChannel.send({
      embeds: [spawnEmbed],
    });

    this.guildFishSpawn[guildId].announcementMessage = announcementMessage;
  }

  private async generateFish(
    messageOrInteraction: Message | Interaction
  ): Promise<Record<string, FishSpawnedResult>> {
    let generatedFish: Record<string, FishSpawnedResult> = {};
    try {
      const { guild } = messageOrInteraction;
      const activeUsers = await getActiveUsers(messageOrInteraction.guild);
      const activeUsersIds = activeUsers
        ? Array.from(activeUsers)
        : [messageOrInteraction.member.user.id];
      // Ensure there's at least one active user to calculate fish count
      const activeUserCount =
        activeUsersIds.length > 0 ? activeUsersIds.length : 1;

      // Get the fishing rods being used among active users.
      const playerFishingRodIds = await getUniqueFishingRodIds(activeUsersIds);

      // Get the best fishing rod being used.
      const bestFishingRodId =
        playerFishingRodIds.length > 0 ? Math.max(...playerFishingRodIds) : 1;
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

  private async canSpawnFish(guildId: string): Promise<boolean> {
    const currentTime = Date.now();
    const lastSpawn = this.guildFishSpawn[guildId]?.lastSpawn || -Infinity;
    const lastHungerAnnouncement = await this.bot.getLastHungerAnnouncementTimestamp(
      guildId
    );
    const elapsedTimeSinceLastHungerMessage =
      currentTime - lastHungerAnnouncement;
    const elapsedTimeSinceLastSpawn = currentTime - lastSpawn;

    return (
      elapsedTimeSinceLastSpawn >= NEXT_SPAWN_IN_MILLISECONDS &&
      elapsedTimeSinceLastHungerMessage >= DELAY_BETWEEN_HUNGER_ANNOUNCEMENT
    );
  }

  private async despawnFish(
    messageOrInteraction: Message | Interaction,
    guildFish: Record<string, FishSpawnedResult>
  ): Promise<void> {
    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      messageOrInteraction
    );
    const { guildId } = messageOrInteraction;
    const embed = await this.getDespawnEmbedAnnouncement(guildId, guildFish);

    this.deleteAnnouncementMessage(guildId);

    delete this.guildFishSpawn[guildId].fish;

    const despawnAnnouncement = await announcementChannel.send({
      embeds: [embed],
    });

    const despawnTimeout = this.guildFishSpawn[guildId].despawnTimeout;
    if (despawnTimeout) {
      clearTimeout(despawnTimeout);
    }

    setTimeout(() => {
      if (despawnAnnouncement && despawnAnnouncement.deletable) {
        despawnAnnouncement.delete().catch(() => null);
      }
    }, DELETE_ANNOUNCEMENT_AFTER);
  }

  private async areAnnouncementsEnabled(guildId: string): Promise<boolean> {
    if (!this.bot.guildSettings.has(guildId)) {
      return true;
    }

    const settings = this.bot.guildSettings.get(guildId);

    return await settings.get(Settings.FishingAnnouncements, true);
  }

  private async getSpawnEmbedAnnouncement(
    guildId: string,
    fish: Record<string, FishSpawnedResult>
  ): Promise<EmbedBuilder> {
    const currentMood = await this.bot.getCurrentMood(guildId);
    const fishCountsByRarity = countFishByRarity(fish);

    // Generate the announcement message text based on the current mood and spawned fish
    const announementMessageText = this.getFishSpawnAnnouncementMessage(
      currentMood,
      fish
    );

    const nextDespawnTimestamp = this.guildFishSpawn[guildId]
      .nextDespawnTimestamp;
    const nextDespawnTimeInSeconds = Math.floor(nextDespawnTimestamp / 1000);
    const spawnAnnouncement = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("Fish Spawn Alert")
      .setDescription(announementMessageText)
      .addFields({
        name: "Time Limit",
        value: `⏳ The fish will despawn <t:${nextDespawnTimeInSeconds}:R>`,
        inline: false,
      })
      .setFooter({
        text: "Use /catch to start fishing. Happy fishing!",
      })
      .setTimestamp();

    for (const [key, value] of Object.entries(fishCountsByRarity)) {
      if (value < 1) {
        continue;
      }
      spawnAnnouncement.addFields({
        name: `${FISH_RARITY_ICONS[key]} ${key} Fish`,
        value: `${value}`,
        inline: true,
      });
    }

    return spawnAnnouncement;
  }

  private async getDespawnEmbedAnnouncement(
    guildId: string,
    guildFish: Record<string, FishSpawnedResult>
  ): Promise<EmbedBuilder> {
    const currentMood = await this.bot.getCurrentMood(guildId);
    const hasGuildFish = this.hasGuildFish(guildId);

    // Generate the announcement message text based on the current mood and spawned fish
    const announementMessage = !hasGuildFish
      ? this.getAllFishCaughtAnnouncementMessage(currentMood)
      : this.getFishDespawnAnnouncementMessage(currentMood, guildFish);
    const title = !hasGuildFish ? "All Fish Caught" : "Fish Despawn";

    const spawnAnnouncement = createEmbed(announementMessage)
      .setTitle(title)
      .setTimestamp();

    return spawnAnnouncement;
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

  private getAllFishCaughtAnnouncementMessage(currentMood: Mood): string {
    return this.getRandomAnnouncement(
      ALL_FISH_CAUGHT_ANNOUNCEMENTS[currentMood]
    );
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

  private createCatchResult(
    fishCaught: Fish | null,
    achievements: Achievement[],
    baitUsed: Bait,
    fishingRodUsed: FishingRod
  ): CatchResult {
    return {
      fishCaught,
      achievements,
      baitUsed,
      fishingRodUsed,
    };
  }
}
