import { User } from "./user";

/**
 * Represents a comment in the system.
 */
export class Comment {
  /**
   * The unique identifier of the comment.
   */
  readonly id!: number;

  /**
   * The identifier of the parent comment, if any.
   */
  readonly parent_id!: number;

  /**
   * The type of resource the comment is associated with.
   */
  readonly resource!: "Game" | "Fireside_Post" | "User";

  /**
   * The identifier of the resource the comment is associated with.
   */
  readonly resource_id!: number;

  /**
   * The user who posted the comment.
   */
  readonly user!: User;

  /**
   * The number of votes the comment has received.
   */
  readonly votes!: number;

  /**
   * The status of the comment.
   */
  readonly status!: number;

  /**
   * The timestamp when the comment was posted.
   */
  readonly posted_on!: number;

  /**
   * The timestamp when the comment was last modified, if any.
   */
  readonly modified_on?: number;

  /**
   * The language of the comment.
   */
  readonly lang!: string;

  /**
   * Indicates whether the comment is pinned.
   */
  readonly is_pinned!: boolean;

  /**
   * The content of the comment.
   */
  readonly comment_content!: string;

  /**
   * @param data Partial data to initialize the comment.
   */
  constructor(data: Partial<Comment>) {
    Object.assign(this, data);

    if (data.user) {
      this.user = new User(data.user);
    }
  }
}
