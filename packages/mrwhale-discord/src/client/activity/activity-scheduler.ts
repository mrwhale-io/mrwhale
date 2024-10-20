import { DiscordBotClient } from "../discord-bot-client";
import { Activity } from "../../types/activities/activity";
import { Activities } from "../../types/activities/activities";

const NEXT_ACTIVITY_RUN_INTERVAL = 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const MAX_RESCHEDULES = 5; // Limit the number of reschedules to prevent infinite loops

/**
 * The activity scheduler is responsible for scheduling and running events.
 */
export class ActivityScheduler {
  /**
   * The list of activities scheduled.
   */
  readonly activities: Activity[];

  private activityTimeoutId: NodeJS.Timeout | null = null;
  private lastActivity: Activities = Activities.HungerAnnouncement;

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
   * Get the next scheduled activity for a guild of a specific type.
   * @param guildId The guild to check for the next activity.
   * @param activityType The type of activity to check for.
   * @returns The next scheduled activity, or null if no activity is scheduled.
   */
  getUpcomingActivityByType(
    guildId: string,
    activityType: Activities
  ): Activity | null {
    // Find the next scheduled activity for the given guild and activity type
    const upcomingActivity = this.activities.find(
      (activity) =>
        activity.guildId === guildId && activity.name === activityType
    );

    return upcomingActivity || null;
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
    // Check if the same type of event is already scheduled for the guild
    if (this.hasScheduledEvent(activity.guildId, activity.name)) {
      return false;
    }

    // Loop to check and reschedule until no overlap exists with previous or next activities
    let hasConflict: boolean;
    let rescheduleCount = 0;
    do {
      hasConflict = false;

      if (this.handlePreviousActivityConflict(activity)) {
        hasConflict = true;
      }

      if (this.handleNextActivityConflict(activity)) {
        hasConflict = true;
      }
    
      rescheduleCount++;
      if (rescheduleCount >= MAX_RESCHEDULES) {
        this.botClient.logger.error(
          `Failed to schedule activity ${activity.name} in guild ${activity.guildId} after ${MAX_RESCHEDULES} reschedules.`
        );
        return false;
      }
    } while (hasConflict);

    this.activities.push(activity);
    this.activities.sort((a, b) => a.startTime - b.startTime);

    return true;
  }

  /**
   * Remove an activity from the scheduler.
   * @param activity The activity to remove.
   */
  removeActivity(activity: Activity): void {
    const index = this.activities.findIndex(
      (existingActivity) =>
        existingActivity.guildId === activity.guildId &&
        existingActivity.name === activity.name
    );

    if (index !== -1) {
      this.activities.splice(index, 1);
    }
  }

  /**
   * Runs the activity scheduler.
   *
   * The activity scheduler periodically checks for activities and starts or ends them based on their start and end times.
   * It uses a setInterval function to run the scheduler at a specified interval.
   */
  run(): void {
    this.activityTimeoutId = setInterval(async () => {
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

  /**
   * Stops the activity scheduler.
   *
   * This method clears the interval used to run the scheduler, effectively stopping the scheduler.
   */
  stop(): void {
    // Clear the interval to stop the scheduler
    if (this.activityTimeoutId) {
      clearInterval(this.activityTimeoutId);
    }
  }

  /**
   * Decides the next activity based on the last activity.
   *
   * The method cycles through the activities in the following order:
   * - TreasureHunt -> FishSpawn
   * - FishSpawn -> HungerAnnouncement
   * - HungerAnnouncement -> TreasureHunt
   *
   * @returns The next activity to be performed.
   */
  decideNextActivity(): Activities {
    switch (this.lastActivity) {
      case Activities.TreasureHunt:
        this.lastActivity = Activities.FishSpawn;
        break;
      case Activities.FishSpawn:
        this.lastActivity = Activities.HungerAnnouncement;
        break;
      case Activities.HungerAnnouncement:
      default:
        this.lastActivity = Activities.TreasureHunt;
        break;
    }
    return this.lastActivity;
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

  private handlePreviousActivityConflict(activity: Activity): boolean {
    const previousActivity = this.getPreviousActivity(activity);

    if (
      previousActivity &&
      activity.startTime < previousActivity.endTime + ONE_HOUR_IN_MS
    ) {
      this.rescheduleActivityAfterPrevious(activity, previousActivity);
      return true;
    }

    return false;
  }

  private handleNextActivityConflict(activity: Activity): boolean {
    const nextActivity = this.getNextActivity(activity);

    if (
      nextActivity &&
      activity.endTime > nextActivity.startTime - ONE_HOUR_IN_MS
    ) {
      this.rescheduleActivityBeforeNext(activity, nextActivity);
      return true;
    }

    return false;
  }

  /**
   * Reschedule an activity to ensure a 1-hour gap after the previous event.
   * @param activity The activity to reschedule.
   * @param previousActivity The previous activity.
   * @returns The rescheduled activity.
   */
  private rescheduleActivityAfterPrevious(
    activity: Activity,
    previousActivity: Activity
  ): void {
    const activityDuration = activity.endTime - activity.startTime;
    activity.startTime = previousActivity.endTime + ONE_HOUR_IN_MS;
    activity.endTime = activity.startTime + activityDuration;

    this.botClient.logger.info(
      `Activity ${activity.name} in guild ${
        activity.guildId
      } was rescheduled to ensure a 1-hour gap after the previous event. New start time: ${new Date(
        activity.startTime
      )}, new end time: ${new Date(activity.endTime)}`
    );
  }

  /**
   * Reschedule an activity to ensure a 1-hour gap before the next event.
   * @param activity The activity to reschedule.
   * @param nextActivity The next activity.
   * @returns The rescheduled activity
   */
  private rescheduleActivityBeforeNext(
    activity: Activity,
    nextActivity: Activity
  ): void {
    const activityDuration = activity.endTime - activity.startTime;
    activity.startTime =
      nextActivity.startTime - ONE_HOUR_IN_MS - activityDuration;
    activity.endTime = activity.startTime + activityDuration;

    this.botClient.logger.info(
      `Activity ${activity.name} in guild ${
        activity.guildId
      } was rescheduled to ensure a 1-hour gap before the next event. New start time: ${new Date(
        activity.startTime
      )}, new end time: ${new Date(activity.endTime)}`
    );
  }

  /**
   * This method finds the next activity that occurs after the provided activity's end time.
   * @param activity The activity to check for the next event.
   */
  private getNextActivity(activity: Activity): Activity | null {
    return (
      this.activities.find((existingActivity) => {
        return (
          existingActivity.guildId === activity.guildId &&
          existingActivity.startTime >= activity.endTime
        );
      }) || null
    );
  }

  /**
   * Retrieves the most recent activity that overlaps with the given activity.
   *
   * @param activity The activity to find the previous overlapping activity for.
   * @returns The most recent overlapping activity, or `null` if no overlapping activities are found.
   */
  private getPreviousActivity(activity: Activity): Activity | null {
    // Find all activities that overlap with the given activity
    const previousActivities = this.activities.filter((existingActivity) => {
      return (
        existingActivity.guildId === activity.guildId &&
        existingActivity.endTime > activity.startTime - ONE_HOUR_IN_MS &&
        existingActivity.startTime < activity.endTime
      );
    });

    // Sort by end time in descending order and return the most recent one
    previousActivities.sort((a, b) => b.endTime - a.endTime);

    return previousActivities.length > 0 ? previousActivities[0] : null;
  }
}
