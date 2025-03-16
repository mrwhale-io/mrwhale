import { UserTheme } from "./user-theme";

/**
 * Represents a user in the system.
 */
export class User {
  /**
   * The unique identifier of the user.
   */
  id!: number;

  /**
   * The identifier of the private room associated with the user.
   */
  room_id!: number;

  /**
   * The timestamp of the user's last message.
   */
  last_message_on!: number;

  /**
   * The username of the user.
   */
  username!: string;

  /**
   * The display name of the user.
   */
  display_name!: string;

  /**
   * The URL of the user's avatar image.
   */
  img_avatar!: string;

  /**
   * The permission level of the user.
   */
  permission_level!: number;

  /**
   * The URL of the user's profile.
   */
  url!: string;

  /**
   * The type of the user.
   */
  type!: string;

  /**
   * The name of the user.
   */
  name!: string;

  /**
   * The website of the user.
   */
  web_site!: string;

  /**
   * The slug of the user.
   */
  slug!: string;

  /**
   * The dogtag of the user.
   */
  dogtag!: string;

  /**
   * The status of the user.
   */
  status!: number;

  /**
   * The date when the user was created.
   */
  created_on!: Date;

  /**
   * The number of followers the user has.
   */
  follower_count!: number;

  /**
   * The number of users the user is following.
   */
  following_count!: number;

  /**
   * The number of comments the user has made.
   */
  comment_count!: number;

  /**
   * The theme associated with the user.
   */
  theme?: UserTheme;

  /**
   * @param data Partial data to initialize the user.
   */
  constructor(data: Partial<User> = {}) {
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
