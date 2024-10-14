import { ActivityScheduler } from "../activity/activity-scheduler";
import { DiscordBotClient } from "../discord-bot-client";

/**
 * The activity scheduler manager is responsible for managing activity schedulers.
 */
export class ActivitySchedulerManager {
  private botClient: DiscordBotClient;
  private schedulers: Map<string, ActivityScheduler>;

  constructor(botClient: DiscordBotClient) {
    this.botClient = botClient;
    this.schedulers = new Map();
    this.initializeSchedulers();
  }

  /**
   * Retrieves the activity scheduler for a given guild.
   *
   * @param guildId - The unique identifier of the guild.
   * @returns The activity scheduler associated with the specified guild, or undefined if no scheduler is found.
   */
  getScheduler(guildId: string): ActivityScheduler | undefined {
    return this.schedulers.get(guildId);
  }

  /**
   * Adds a new activity scheduler for the specified guild if it doesn't already exist.
   *
   * @param guildId The unique identifier of the guild for which the scheduler is to be added.
   *
   * @remarks
   * This method checks if a scheduler for the given guild ID already exists in the `schedulers` map.
   * If it does not exist, it creates a new `ActivityScheduler` instance, adds it to the map, and starts the scheduler.
   */
  addScheduler(guildId: string): void {
    if (!this.schedulers.has(guildId)) {
      const scheduler = new ActivityScheduler(this.botClient);
      this.schedulers.set(guildId, scheduler);
      scheduler.run(); // Start the scheduler for the guild
    }
  }

  /**
   * Removes the activity scheduler for the specified guild if it exists.
   *
   * @param guildId The unique identifier of the guild for which the scheduler is to be removed.
   *
   * @remarks
   * This method checks if a scheduler for the given guild ID exists in the `schedulers` map.
   * If it does, it stops the scheduler and removes it from the map.
   */
  removeScheduler(guildId: string): void {
    const scheduler = this.schedulers.get(guildId);
    if (scheduler) {
      scheduler.stop(); // Stop the scheduler for the guild
      this.schedulers.delete(guildId);
    }
  }

  /**
   * Initializes activity schedulers for each guild in the bot client's cache.
   *
   * This method iterates over all guilds in the bot client's cache, creates a new
   * `ActivityScheduler` for each guild, stores it in the `schedulers` map with the
   * guild's ID as the key, and starts the scheduler.
   *
   * @remarks
   * This method should be called to set up and start activity schedulers for all
   * guilds that the bot is a member of.
   */
  private initializeSchedulers(): void {
    this.botClient.client.guilds.cache.forEach((guild) => {
      const scheduler = new ActivityScheduler(this.botClient);
      this.schedulers.set(guild.id, scheduler);
      scheduler.run(); // Start the scheduler for the guild
    });
  }
}
