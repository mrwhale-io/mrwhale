import { ContentContext } from "./content/content-context";
export declare const Events: {
    MESSAGE: string;
    MESSAGE_UPDATE: string;
    NOTIFICATION: string;
    USER_UPDATED: string;
    FRIEND_UPDATED: string;
    FRIEND_ADD: string;
    FRIEND_REMOVE: string;
    YOU_UPDATED: string;
    MEMBER_ADD: string;
    MEMBER_LEAVE: string;
    OWNER_SYNC: string;
    GROUP_ADD: string;
    GROUP_LEAVE: string;
};
export declare const Endpoints: {
    requests: string;
    friend_accept: (id: number) => string;
    friend_request: (id: number) => string;
    game: (id: number) => string;
    game_overview: (id: number) => string;
    comments_save: string;
    media_upload: string;
    media_items: string;
    temp_resource: (content: ContentContext) => string;
    fireside: (id: string) => string;
};
