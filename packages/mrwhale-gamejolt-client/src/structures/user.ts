import { UserTheme } from "./user-theme";

/**
 * Represents a Game Jolt user.
 */
export class User {
  /**
   * The unique identifier of the user.
   */
  readonly id!: number;

  /**
   * The identifier of the private room associated with the user.
   */
  readonly room_id!: number;

  /**
   * The timestamp of the user's last message.
   */
  readonly last_message_on!: number;

  /**
   * The username of the user.
   */
  readonly username!: string;

  /**
   * The display name of the user.
   */
  readonly display_name!: string;

  /**
   * The URL of the user's avatar image.
   */
  readonly img_avatar!: string;

  /**
   * The permission level of the user.
   */
  readonly permission_level!: number;

  /**
   * The URL of the user's profile.
   */
  readonly url!: string;

  /**
   * The type of the user.
   */
  readonly type!: string;

  /**
   * The name of the user.
   */
  readonly name!: string;

  /**
   * The website of the user.
   */
  readonly web_site!: string;

  /**
   * The slug of the user.
   */
  readonly slug!: string;

  /**
   * The dogtag of the user.
   */
  readonly dogtag!: string;

  /**
   * The status of the user.
   */
  readonly status!: number;

  /**
   * The date when the user was created.
   */
  readonly created_on!: Date;

  /**
   * The number of followers the user has.
   */
  readonly follower_count!: number;

  /**
   * The number of users the user is following.
   */
  readonly following_count!: number;

  /**
   * The number of comments the user has made.
   */
  readonly comment_count!: number;

  /**
   * The theme associated with the user.
   */
  readonly theme?: UserTheme;

  /**
   * @param data Partial data to initialize the user.
   */
  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);

    if (
      typeof this.created_on === "number" ||
      typeof this.created_on === "string"
    ) {
      this.created_on = new Date(this.created_on);
    }

    if (data.theme) {
      this.theme = new UserTheme(data.theme);
    }
  }
}
