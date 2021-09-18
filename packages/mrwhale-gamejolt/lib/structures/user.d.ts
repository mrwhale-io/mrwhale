export declare class User {
    id: number;
    room_id: number;
    last_message_on: number;
    username: string;
    display_name: string;
    img_avatar: string;
    permission_level: number;
    url: string;
    type: string;
    name: string;
    web_site: string;
    slug: string;
    dogtag: string;
    status: number;
    created_on: Date;
    follower_count: number;
    following_count: number;
    comment_count: number;
    constructor(data?: Partial<User>);
}
