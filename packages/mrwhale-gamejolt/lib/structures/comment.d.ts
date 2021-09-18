import { User } from "./user";
export declare class Comment {
    id: number;
    parent_id: number;
    resource: "Game" | "Fireside_Post" | "User";
    resource_id: number;
    user: User;
    votes: number;
    status: number;
    posted_on: number;
    modified_on?: number;
    lang: string;
    is_pinned: boolean;
    comment_content: string;
    constructor(data: Partial<Comment>);
}
