import { Time } from "../types/time";

/**
 * Utility class for time-related operations and conversions.
 *
 * Provides static methods for converting milliseconds to human-readable time formats
 * and calculating time differences between timestamps.
 *
 * @example
 * ```typescript
 * // Convert milliseconds to time components
 * const time = TimeUtilities.convertMs(90061000); // 1 day, 1 hour, 1 minute, 1 second
 *
 * // Calculate difference between timestamps
 * const diff = TimeUtilities.difference(Date.now(), Date.now() - 3600000); // 1 hour difference
 * ```
 */
export class TimeUtilities {
  /**
   * Convert timestamp in miliseconds to days, hours, minutes and seconds.
   * @param ms Time in milliseconds.
   */
  static convertMs(ms: number): Time {
    const timestamp = new Time();

    let h, m, s;

    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;

    const d = Math.floor(h / 24);

    h = h % 24;

    timestamp.days = d;
    timestamp.hours = h;
    timestamp.minutes = m;
    timestamp.seconds = s;

    return timestamp;
  }

  /**
   * Get a time difference between two timestamps.
   * @param a The first time.
   * @param b The second time.
   */
  static difference(a: number, b: number): Time {
    const ms = a - b;
    const difference = TimeUtilities.convertMs(ms);

    return difference;
  }
}
