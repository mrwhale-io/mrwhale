import { Game } from "./game";
import { User } from "./user";
import { FiresidePost } from "./fireside-post";
import { Comment } from "./comment";

export class Notification {
  id!: number;
  user_id!: number;
  type!: string;
  added_on!: number;
  viewed_on!: number | null;
  from_resource!: string;
  from_resource_id!: number;
  from_model?: User;
  action_resource!: string;
  action_resource_id!: number;
  action_model!: FiresidePost | Comment;
  to_resource!: string | null;
  to_resource_id!: number | null;
  to_model?: Game | User | FiresidePost;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(data: any) {
    Object.assign(this, data);

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
