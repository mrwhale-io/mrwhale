"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Endpoints = exports.Events = void 0;
exports.Events = {
    MESSAGE: "message",
    MESSAGE_UPDATE: "message_update",
    NOTIFICATION: "notification",
    USER_UPDATED: "user_updated",
    FRIEND_UPDATED: "friend_updated",
    FRIEND_ADD: "friend_add",
    FRIEND_REMOVE: "friend_remove",
    YOU_UPDATED: "you_updated",
    MEMBER_ADD: "member_add",
    MEMBER_LEAVE: "member_leave",
    OWNER_SYNC: "owner_sync",
    GROUP_ADD: "group_add",
    GROUP_LEAVE: "group_leave",
};
exports.Endpoints = {
    requests: `/web/dash/friends/requests/requests`,
    friend_accept: (id) => `/web/dash/friends/requests/accept/${id}`,
    friend_request: (id) => `/web/dash/friends/requests/add/${id}`,
    game: (id) => `/web/discover/games/${id}`,
    game_overview: (id) => `/web/discover/games/overview/${id}`,
    comments_save: `/comments/save`,
    media_upload: `/web/dash/media-items/add-one`,
    media_items: `/web/dash/media-items`,
    temp_resource: (content) => `/web/content/temp-resource-id/${content}`,
    fireside: (id) => `/web/fireside/fetch/${id}`,
};
