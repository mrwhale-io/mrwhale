import { User } from "./user";

/**
 * Represents a comment in the system.
 */
export class Comment {
  /**
   * The unique identifier of the comment.
   */
  id!: number;

  /**
   * The identifier of the parent comment, if any.
   */
  parent_id!: number;

  /**
   * The type of resource the comment is associated with.
   */
  resource!: "Game" | "Fireside_Post" | "User";

  /**
   * The identifier of the resource the comment is associated with.
   */
  resource_id!: number;

  /**
   * The user who posted the comment.
   */
  user!: User;

  /**
   * The number of votes the comment has received.
   */
  votes!: number;

  /**
   * The status of the comment.
   */
  status!: number;

  /**
   * The timestamp when the comment was posted.
   */
  posted_on!: number;

  /**
   * The timestamp when the comment was last modified, if any.
   */
  modified_on?: number;

  /**
   * The language of the comment.
   */
  lang!: string;

  /**
   * Indicates whether the comment is pinned.
   */
  is_pinned!: boolean;

  /**
   * The content of the comment.
   */
  comment_content!: string;

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
