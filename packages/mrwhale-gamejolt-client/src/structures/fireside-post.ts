import { Game } from "./game";
import { User } from "./user";

/**
 * Represents a Game Jolt Fireside post.
 */
export class FiresidePost {
  /**
   * The unique identifier of the post.
   */
  id!: number;

  /**
   * The type of the post.
   */
  type!: "text" | "media" | "video" | "sketchfab" | "comment-video";

  /**
   * The hash of the post.
   */
  hash!: string;

  /**
   * The status of the post.
   */
  status!: string;

  /**
   * The timestamp when the post was added.
   */
  added_on!: number;

  /**
   * The timestamp when the post was last updated.
   */
  updated_on!: number;

  /**
   * The timestamp when the post was published.
   */
  published_on!: number;

  /**
   * The timezone for the scheduled post.
   */
  scheduled_for_timezone!: string | null;

  /**
   * The timestamp for when the post is scheduled.
   */
  scheduled_for!: number | null;

  /**
   * The number of likes the post has received.
   */
  like_count!: number;

  /**
   * The number of comments on the post.
   */
  comment_count!: number;

  /**
   * The user who created the post.
   */
  user!: User;

  /**
   * The game associated with the post, if any.
   */
  game?: Game;

  /**
   * Indicates if the post is made by the game owner.
   */
  as_game_owner!: boolean;

  /**
   * Indicates if the post should be published to the user's profile.
   */
  post_to_user_profile!: boolean;

  /**
   * The slug of the post.
   */
  slug!: string;

  /**
   * The subline of the post.
   */
  subline!: string;

  /**
   * The URL of the post.
   */
  url!: string;

  /**
   * The number of views the post has received.
   */
  view_count?: number;

  /**
   * Indicates if the post is pinned.
   */
  is_pinned!: boolean;

  /**
   * Indicates if the post has an article.
   */
  has_article!: boolean;

  /**
   * The lead content of the post.
   */
  lead_content!: string;

  /**
   * The lead string of the post.
   */
  leadStr!: string;

  /**
   * The article content of the post.
   */
  article_content!: string;

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
