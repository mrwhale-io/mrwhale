import { Game } from "./game";
import { User } from "./user";
import { FiresidePost } from "./fireside-post";
import { Comment } from "./comment";
export declare class Notification {
    id: number;
    user_id: number;
    type: string;
    added_on: number;
    viewed_on: number | null;
    from_resource: string;
    from_resource_id: number;
    from_model?: User;
    action_resource: string;
    action_resource_id: number;
    action_model: FiresidePost | Comment;
    to_resource: string | null;
    to_resource_id: number | null;
    to_model?: Game | User | FiresidePost;
    constructor(data: any);
}
