import { Game } from "./game";
import { User } from "./user";

/**
 * Represents a Game Jolt Fireside post.
 */
export class FiresidePost {
  /**
   * The unique identifier of the post.
   */
  readonly id!: number;

  /**
   * The type of the post.
   */
  readonly type!: "text" | "media" | "video" | "sketchfab" | "comment-video";

  /**
   * The hash of the post.
   */
  readonly hash!: string;

  /**
   * The status of the post.
   */
  readonly status!: string;

  /**
   * The timestamp when the post was added.
   */
  readonly added_on!: number;

  /**
   * The timestamp when the post was last updated.
   */
  readonly updated_on!: number;

  /**
   * The timestamp when the post was published.
   */
  readonly published_on!: number;

  /**
   * The timezone for the scheduled post.
   */
  readonly scheduled_for_timezone!: string | null;

  /**
   * The timestamp for when the post is scheduled.
   */
  readonly scheduled_for!: number | null;

  /**
   * The number of likes the post has received.
   */
  readonly like_count!: number;

  /**
   * The number of comments on the post.
   */
  readonly comment_count!: number;

  /**
   * The user who created the post.
   */
  readonly user!: User;

  /**
   * The game associated with the post, if any.
   */
  readonly game?: Game;

  /**
   * Indicates if the post is made by the game owner.
   */
  readonly as_game_owner!: boolean;

  /**
   * Indicates if the post should be published to the user's profile.
   */
  readonly post_to_user_profile!: boolean;

  /**
   * The slug of the post.
   */
  readonly slug!: string;

  /**
   * The subline of the post.
   */
  readonly subline!: string;

  /**
   * The URL of the post.
   */
  readonly url!: string;

  /**
   * The number of views the post has received.
   */
  readonly view_count?: number;

  /**
   * Indicates if the post is pinned.
   */
  readonly is_pinned!: boolean;

  /**
   * Indicates if the post has an article.
   */
  readonly has_article!: boolean;

  /**
   * The lead content of the post.
   */
  readonly lead_content!: string;

  /**
   * The lead string of the post.
   */
  readonly leadStr!: string;

  /**
   * The article content of the post.
   */
  readonly article_content!: string;

  /**
   * Creates an instance of FiresidePost.
   * @param data - Partial data to initialize the post.
   */
  constructor(data: Partial<FiresidePost>) {
    Object.assign(this, data);

    if (data.user) {
      this.user = new User(data.user);
    }

    if (data.game) {
      this.game = new Game(data.game);
    }
  }
}
