import { Game } from "./game";
import { User } from "./user";
export declare class FiresidePost {
    id: number;
    type: "text" | "media" | "video" | "sketchfab" | "comment-video";
    hash: string;
    status: string;
    added_on: number;
    updated_on: number;
    published_on: number;
    scheduled_for_timezone: string | null;
    scheduled_for: number | null;
    like_count: number;
    comment_count: number;
    user: User;
    game?: Game;
    as_game_owner: boolean;
    post_to_user_profile: boolean;
    slug: string;
    subline: string;
    url: string;
    view_count?: number;
    is_pinned: boolean;
    has_article: boolean;
    lead_content: string;
    leadStr: string;
    article_content: string;
    constructor(data: Partial<FiresidePost>);
}
