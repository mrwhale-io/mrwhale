/**
 * Represents a user's theme settings.
 */
export class UserTheme {
  /**
   * The unique identifier for the theme.
   */
  id!: number;

  /**
   * The color used for highlights.
   * @default "ccff00"
   */
  highlight!: string;

  /**
   * The color used for backlights.
   * @default "2f7f6f"
   */
  backlight!: string;

  /**
   * The color used for notices.
   * @default "ff3fac"
   */
  notice!: string;

  /**
   * The color used for tints.
   * @default "4800ff"
   */
  tint?: string;

  /**
   * The identifier for the theme preset.
   */
  theme_preset_id?: number;

  /**
   * Custom theme settings in a string format.
   */
  custom?: string;

  /**
   * @param data Partial data to initialize the UserTheme instance.
   */
  constructor(data: Partial<UserTheme> = {}) {
    Object.assign(this, data);
    this.highlight = this.highlight || "ccff00";
    this.backlight = this.backlight || "2f7f6f";
    this.notice = this.notice || "ff3fac";
    this.tint = this.tint || "4800ff";
  }
}
