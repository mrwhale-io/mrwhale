import { DiscordBotClient } from "../discord-bot-client";
import { Activity } from "../../types/activities/activity";
import { Activities } from "../../types/activities/activities";

const NEXT_ACTIVITY_RUN_INTERVAL = 1000;

/**
 * The activity scheduler is responsible for scheduling and running events.
 */
export class ActivityScheduler {
  /**
   * The list of activities scheduled.
   */
  readonly activities: Activity[];

  /**
   * Cooldowns for each guild to prevent spamming activities.
   */
  private guildCooldowns: { [guildId: string]: number } = {}; // Store cooldown end times for each guild

  /**
   * The cooldown duration for each guild.
   */
  private cooldownDuration: number = 3 * 60 * 1000;

  constructor(private botClient: DiscordBotClient) {
    this.activities = [];
  }

  /**
   * Get the current running activity for a guild.
   * @param guildId The guild to check for a running activity.
   * @returns The current running activity, or null if no activity is running.
   */
  getCurrentRunningActivity(guildId: string): Activity | null {
    const currentTime = Date.now();

    // Find an activity that is currently running for the given guildId
    const runningActivity = this.activities.find((activity) => {
      return (
        activity.guildId === guildId &&
        activity.startTime <= currentTime &&
        activity.endTime >= currentTime
      );
    });

    return runningActivity || null; // Return the activity if found, otherwise return null
  }

  /**
   * Check if a specific event type is already scheduled for a guild
   * @param guildId The guild to check
   * @param eventType The type of event to check for (e.g., 'fishSpawn')
   * @returns True if an event of the same type is already scheduled
   */
  hasScheduledEvent(guildId: string, eventType: Activities): boolean {
    return this.activities.some(
      (activity) => activity.guildId === guildId && activity.name === eventType
    );
  }

  /**
   * Add an activity to the scheduler.
   * @param activity The activity to add.
   * @returns True if the activity was added, false otherwise.
   */
  addActivity(activity: Activity): boolean {
    console.log(activity);
    // Check if the same type of event is already scheduled for the guild
    if (this.isEventAlreadyScheduled(activity)) {
      return false;
    }

    // Check if the guild is in cooldown period
    if (this.isGuildInCooldown(activity.guildId)) {
      return false;
    }

    // Check for overlapping activities in the same guild
    if (this.isActivityOverlapping(activity)) {
      return false;
    }

    this.activities.push(activity);
    this.activities.sort((a, b) => a.startTime - b.startTime); // Sort events by time

    // Update the cooldown end time for the guild
    this.updateCooldown(activity);

    return true;
  }

  /**
   * Run the activity scheduler.
   */
  run(): void {
    setInterval(async () => {
      const currentTime = Date.now();
      if (this.activities.length === 0) {
        return;
      }

      const nextActivity = this.activities[0];
      if (nextActivity.startTime <= currentTime && !nextActivity.hasStarted) {
        nextActivity.hasStarted = true;
        await this.startActivity(nextActivity);
      }

      if (nextActivity.endTime <= currentTime) {
        await this.endActivity(nextActivity);
        this.activities.shift();
      }
    }, NEXT_ACTIVITY_RUN_INTERVAL); // Check every second
  }

  private async startActivity(activity: Activity): Promise<void> {
    const activityHandler = this.botClient.activities.get(activity.name);

    if (!activityHandler) {
      this.botClient.logger.error(
        `Activity handler for ${activity.name} not found.`
      );
      return;
    }

    // Perform the activity (like spawning fish)
    await activityHandler
      .action(activity)
      .catch((e) => this.botClient.logger.error(e));
  }

  private async endActivity(activity: Activity): Promise<void> {
    const activityHandler = this.botClient.activities.get(activity.name);

    if (!activityHandler) {
      this.botClient.logger.error(
        `Activity handler for ${activity.name} not found.`
      );
      return;
    }

    // Check if the endAction method is implemented by the handler before calling it
    if (activityHandler.endAction) {
      // Perform any cleanup when the event ends
      await activityHandler
        .endAction(activity)
        .catch((e) => this.botClient.logger.error(e));
    }

    // Delete the notification if it exists
    if (
      activity.notificationMessage &&
      activity.notificationMessage.deletable
    ) {
      await activity.notificationMessage.delete().catch(() => null);
    }
  }

  /**
   * Check if the same type of event is already scheduled for the guild.
   * @param activity The activity to check.
   */
  private isEventAlreadyScheduled(activity: Activity): boolean {
    if (this.hasScheduledEvent(activity.guildId, activity.name)) {
      this.botClient.logger.info(
        `Cannot add activity ${activity.name} in guild ${activity.guildId}: event already scheduled.`
      );
      return true;
    }
    return false;
  }

  /**
   * Check if the guild is currently in the cooldown period.
   * @param guildId The guild to check.
   */
  private isGuildInCooldown(guildId: string): boolean {
    const currentTime = Date.now();
    const guildCooldownEndTime = this.guildCooldowns[guildId] || 0;
    if (currentTime < guildCooldownEndTime) {
      this.botClient.logger.info(
        `Cannot add activity in guild ${guildId}: cooldown period active.`
      );
      return true;
    }
    return false;
  }

  /**
   * Check if the new activity overlaps with existing ones in the same guild.
   * @param activity The activity to check overlap.
   */
  private isActivityOverlapping(activity: Activity): boolean {
    if (this.checkActivityOverlap(activity)) {
      this.botClient.logger.info(
        `Cannot add activity ${activity.name} in guild ${activity.guildId}: overlapping activity detected.`
      );
      return true;
    }
    return false;
  }

  /**
   * Update the cooldown period for the guild after adding an activity.
   * @param activity The activity to update the cooldown for.
   */
  private updateCooldown(activity: Activity): void {
    this.guildCooldowns[activity.guildId] =
      activity.endTime + this.cooldownDuration;
  }

  /**
   * Check if the new activity overlaps with an existing one in any way.
   * @param activity The activity to check.
   */
  private checkActivityOverlap(activity: Activity): boolean {
    return this.activities.some((existingActivity) => {
      return (
        existingActivity.guildId === activity.guildId &&
        // Check if the new activity overlaps with an existing one in any way
        activity.startTime < existingActivity.endTime &&
        activity.endTime > existingActivity.startTime
      );
    });
  }
}
