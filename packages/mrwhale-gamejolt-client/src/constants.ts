import { ContentContext } from "./content/content-context";

export enum Events {
  MESSAGE = "message",
  MESSAGE_UPDATE = "message_update",
  NOTIFICATION = "notification",
  USER_UPDATED = "user_updated",
  FRIEND_UPDATED = "friend_updated",
  FRIEND_ADD = "friend_add",
  FRIEND_REMOVE = "friend_remove",
  YOU_UPDATED = "you_updated",
  MEMBER_ADD = "member_add",
  MEMBER_LEAVE = "member_leave",
  OWNER_SYNC = "owner_sync",
  GROUP_ADD = "group_add",
  GROUP_LEAVE = "group_leave",
  INVITE_ACCEPT = "invite_accept",
  MEMBER_WATCH = "member_watch",
  CHAT_READY = "chat_ready",
  ROOM_READY = "room_ready",
}

export const Endpoints = {
  block: `/web/dash/blocks/add`,
  blocks: `/web/dash/blocks`,
  unblock: (id: number): string => `/web/dash/blocks/remove/${id}`,
  requests: `/web/dash/friends/requests/requests`,
  friend_accept: (id: number): string =>
    `/web/dash/friends/requests/accept/${id}`,
  friend_request: (id: number): string =>
    `/web/dash/friends/requests/add/${id}`,
  game: (id: number): string => `/web/discover/games/${id}`,
  game_overview: (id: number): string => `/web/discover/games/overview/${id}`,
  comments_save: `/comments/save`,
  media_upload: `/web/dash/media-items/add-one`,
  media_items: `/web/dash/media-items`,
  temp_resource: (content: ContentContext): string =>
    `/web/content/temp-resource-id/${content}`,
  fireside: (id: string): string => `/web/fireside/fetch/${id}`,
};

export const GJ_PLATFORM_VERSION = "1.33.1";
