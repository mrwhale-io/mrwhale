/**
 * Contains properties to be passed to a discord button on construction.
 */
export interface DiscordButtonOptions {
  /**
   * The name of this button.
   */
  name: string;

  /**
   * The cooldown used by the button rate limiter.
   */
  cooldown?: number;
}
