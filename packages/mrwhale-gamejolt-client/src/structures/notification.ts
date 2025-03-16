import { Game } from "./game";
import { User } from "./user";
import { FiresidePost } from "./fireside-post";
import { Comment } from "./comment";

/**
 * Represents a notification in the system.
 */
export class Notification {
  /**
   * The unique identifier of the notification.
   */
  id!: number;

  /**
   * The unique identifier of the user who received the notification.
   */
  user_id!: number;

  /**
   * The type of the notification.
   */
  type!: string;

  /**
   * The timestamp when the notification was added.
   */
  added_on!: number;

  /**
   * The timestamp when the notification was viewed, or null if it hasn't been viewed.
   */
  viewed_on!: number | null;

  /**
   * The resource from which the notification originated.
   */
  from_resource!: string;

  /**
   * The unique identifier of the resource from which the notification originated.
   */
  from_resource_id!: number;

  /**
   * The model of the user from which the notification originated, if applicable.
   */
  from_model?: User;

  /**
   * The resource that the notification is related to.
   */
  action_resource!: string;

  /**
   * The unique identifier of the resource that the notification is related to.
   */
  action_resource_id!: number;

  /**
   * The model of the resource that the notification is related to.
   */
  action_model!: FiresidePost | Comment;

  /**
   * The resource to which the notification is directed.
   */
  to_resource!: string | null;

  /**
   * The unique identifier of the resource to which the notification is directed.
   */
  to_resource_id!: number | null;

  /**
   * The model of the resource to which the notification is directed, if applicable.
   */
  to_model?: Game | User | FiresidePost;

  /**
   * @param data The data to initialize the notification with.
   */
  constructor(data: any) {
    if (data.from_resource === "User" && data.from_resource_id) {
      this.from_model = new User(data.from_resource_model);
    }

    if (data.to_resource === "Game") {
      this.to_model = new Game(data.to_resource_model);
    } else if (data.to_resource === "User") {
      this.to_model = new User(data.to_resource_model);
    } else if (data.to_resource === "Fireside_Post") {
      this.to_model = new FiresidePost(data.to_resource_model);
    }

    if (this.type === "post-add") {
      this.action_model = new FiresidePost(data.action_resource_model);
    } else if (this.type === "comment-add-object-owner") {
      this.action_model = new Comment(data.action_resource_model);
    }
  }
}
