import {
  FishingRod,
  FishSpawnedResult,
  getFishingRodById,
  spawnFish,
} from "@mrwhale-io/core";
import { DiscordBotClient } from "../discord-bot-client";
import { getUniqueFishingRodIds } from "../../database/services/fishing-rods";
import { Activities } from "../../types/activities/activities";
import { Activity } from "../../types/activities/activity";
import { fishSpawnEmbed } from "../../util/embed/fish-spawn-embed";
import { fishDespawnEmbed } from "../../util/embed/fish-despawn-embed";
import { Settings } from "../../types/settings";
import { getActiveUserIds } from "../../util/get-active-user-ids";

const FISH_SPAWN_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours
const FISH_DESPAWN_INTERVAL = 30 * 60 * 1000; // 30 minutes
const FISH_PER_ACTIVE_USER = 5;

/**
 * The FishSpawnDetails interface represents the fish spawn details for a guild.
 */
interface FishSpawnDetails {
  lastSpawn?: number;
  fish: Record<string, FishSpawnedResult>;
}

/**
 * The FishSpawnMap interface represents the fish spawn details for all guilds.
 */
interface FishSpawnMap {
  [guildId: string]: FishSpawnDetails;
}

/**
 * The FishSpawner class is responsible for spawning and despawning fish in a guild.
 * It handles the logic for checking conditions, generating fish, scheduling despawn, and sending notifications.
 * FishSpawner also provides methods to retrieve information about the guild's fish.
 */
export class FishSpawner {
  private guildFishSpawn: FishSpawnMap;

  constructor(private bot: DiscordBotClient) {
    this.guildFishSpawn = {};
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
   * Spawns fish in a guild if certain conditions are met.
   * This method ensures that fish are only spawned in active guilds and non-bot users.
   * It also handles fish spawn notification and scheduling fish despawn.
   *
   * @param activity The activity object containing details about the fish spawn.
   */
  async spawnFishInGuild(activity: Activity): Promise<void> {
    const guildId = activity.guildId;

    try {
      const fish = await this.generateFish(guildId);

      this.generateFishSpawnNotification(activity, fish);
    } catch (error) {
      this.bot.logger.error("Error while spawning fish:", error);
    }
  }

  /**
   * Despawns fish in a guild and sends a despawn notification.
   *
   * @param guildId The ID of the guild.
   * @param guildFish The spawned fish details.
   */
  async despawnFishInGuild(guildId: string): Promise<void> {
    const despawnAnnouncementEmbed = await fishDespawnEmbed(guildId, this.bot);

    delete this.guildFishSpawn[guildId].fish;

    const areAnnouncementsEnabled = await this.areFishingAnnouncementsEnabled(
      guildId
    );

    if (!areAnnouncementsEnabled) {
      return;
    }

    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      guildId
    );

    this.bot.notificationManager.sendNotification(
      announcementChannel,
      despawnAnnouncementEmbed
    );
  }

  /**
   * Requests the ActivityScheduler to schedule a fish spawn event.
   *
   * @param guildId The ID of the guild.
   */
  requestFishSpawn(guildId: string): void {
    const currentTime = Date.now();

    // Create a fish spawn activity
    const fishSpawnActivity: Activity = {
      name: Activities.FishSpawn,
      guildId,
      startTime: currentTime + FISH_SPAWN_INTERVAL, // Schedule spawn after 3 hours
      endTime: currentTime + FISH_SPAWN_INTERVAL + FISH_DESPAWN_INTERVAL, // Despawn after 30 minutes
    };

    // Add the fish spawn activity to the scheduler
    const scheduler = this.bot.activitySchedulerManager.getScheduler(guildId);
    if (scheduler && scheduler.addActivity(fishSpawnActivity)) {
      this.bot.logger.info(`Scheduled fish spawn event for guild: ${guildId}`);
    }
  }

  /**
   * Generates fish based on the active users in a guild.
   * @param guildId The ID of the guild.
   */
  private async generateFish(
    guildId: string
  ): Promise<Record<string, FishSpawnedResult>> {
    let fish: Record<string, FishSpawnedResult> = {};
    try {
      const activeUsersIds = await getActiveUserIds(guildId, this.bot);
      // Ensure there's at least one active user to calculate fish count
      const activeUserCount =
        activeUsersIds.length > 0 ? activeUsersIds.length : 1;

      const bestFishingRod = await this.getBestFishingRodId(activeUsersIds);

      // Calculate the number of fish to spawn based on active users
      const fishCount = activeUserCount * FISH_PER_ACTIVE_USER;

      // Spawn fish based on the most used fishing rod's max catchable rarity
      fish = spawnFish(fishCount, bestFishingRod.maxCatchableRarity);

      // Store the spawned fish in the guild's fish spawn map
      this.guildFishSpawn[guildId] = { lastSpawn: Date.now(), fish };
    } catch (error) {
      this.bot.logger.error("Error generating fish:", error);
    }

    return fish;
  }

  /**
   * Gets the best fishing rod being used among active users in a guild.
   * @param activeUsersIds The IDs of the active users in the guild.
   */
  private async getBestFishingRodId(
    activeUsersIds: string[]
  ): Promise<FishingRod> {
    // Get the fishing rods being used among active users.
    const playerFishingRodIds = await getUniqueFishingRodIds(activeUsersIds);

    // Get the best fishing rod being used.
    const bestFishingRodId =
      playerFishingRodIds.length > 0 ? Math.max(...playerFishingRodIds) : 1;
    const bestFishingRod = getFishingRodById(bestFishingRodId);

    return bestFishingRod;
  }

  /**
   * Generates and sends a fish spawn notification in a guild.
   *
   * @param activity The activity object containing details about the fish spawn.
   * @param fish The spawned fish details.
   */
  private async generateFishSpawnNotification(
    activity: Activity,
    fish: Record<string, FishSpawnedResult>
  ): Promise<void> {
    const guildId = activity.guildId;
    const areAnnouncementsEnabled = await this.areFishingAnnouncementsEnabled(
      guildId
    );

    // Check if any fish have spawned in the guild before sending an announcement
    if (!fish || !areAnnouncementsEnabled) {
      return;
    }

    // Get the configured guild channel for fish spawn announcements
    const announcementChannel = await this.bot.getFishingAnnouncementChannel(
      guildId
    );

    // Generate the embed containing the spawn information
    const spawnEmbed = await fishSpawnEmbed(guildId, fish, this.bot);
    const deleteAfterInMillseconds = activity.endTime - activity.startTime;

    this.bot.notificationManager.sendNotification(
      announcementChannel,
      spawnEmbed,
      deleteAfterInMillseconds
    );
  }

  private async areFishingAnnouncementsEnabled(
    guildId: string
  ): Promise<boolean> {
    if (!this.bot.guildSettings.has(guildId)) {
      return true;
    }

    const settings = this.bot.guildSettings.get(guildId);

    return await settings.get(Settings.FishingAnnouncements, true);
  }
}
