import { Message } from "discord.js";
import { Activities } from "./activities";

/**
 * Represents an activity that can be scheduled.
 */
export interface Activity {
  /**
   * The name of the activity.
   */
  name: Activities;

  /**
   * The start time of the activity.
   */
  startTime: number;

  /**
   * The end time of the activity.
   */
  endTime: number;

  /**
   * The guild id the activity is scheduled for.
   */
  guildId: string;

  /**
   * The message to be sent when the activity is triggered.
   */
  notificationMessage?: Message;

  /**
   * Whether the activity has started.
   */
  hasStarted?: boolean;
}
