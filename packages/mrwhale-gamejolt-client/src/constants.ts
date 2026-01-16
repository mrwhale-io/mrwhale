import { ContentContext } from "./content/content-context";

/**
 * Enum representing various event types used in the application.
 * These events are used to handle different actions and updates
 * within the system, such as messages, notifications, user updates,
 * and more.
 */
export enum Events {
  /**
   * This event is triggered when a new message is sent in the chat.
   */
  MESSAGE = "message",

  /**
   * This event is triggered when a message is updated in the chat.
   */
  MESSAGE_UPDATE = "message_update",

  /**
   * This event is triggered when a new notification is received.
   */
  NOTIFICATION = "notification",

  /**
   * This event is triggered when a group chat user updates their profile.
   */
  USER_UPDATED = "user_updated",

  /**
   * This event is triggered when a friend updates their profile.
   */
  FRIEND_UPDATED = "friend_updated",

  /**
   * This event is triggered when a new friend is added to the client user's friend list.
   */
  FRIEND_ADD = "friend_add",

  /**
   * This event is triggered when a friend is removed from the client user's friend list.
   */
  FRIEND_REMOVE = "friend_remove",

  /**
   * This event is triggered when the client user updates their profile.
   */
  YOU_UPDATED = "you_updated",

  /**
   * This event is triggered when a new member is added to a group chat.
   */
  MEMBER_ADD = "member_add",

  /**
   * This event is triggered when a member leaves a group chat.
   */
  MEMBER_LEAVE = "member_leave",

  /**
   * This event is triggered when the owner of a group chat leaves the group and a new owner is assigned.
   */
  OWNER_SYNC = "owner_sync",

  /**
   * This event is triggered when the client user is added to a group chat.
   * This is not the same as `MEMBER_ADD`, which is triggered when a new member is added to the group.
   */
  GROUP_ADD = "group_add",

  /**
   * This event is triggered when the client user leaves a group chat.
   * This is not the same as `MEMBER_LEAVE`, which is triggered when a member leaves the group.
   */
  GROUP_LEAVE = "group_leave",

  /**
   * This event accepts an invitation to a group chat.
   */
  INVITE_ACCEPT = "invite_accept",

  /**
   * This event watches the members list of a group chat.
   * This is not the same as `MEMBER_ADD`, which is triggered when a new member is added to the group.
   */
  MEMBER_WATCH = "member_watch",

  /**
   * This event is triggered when the chat is ready.
   */
  CHAT_READY = "chat_ready",

  /**
   * This event is triggered when the room is ready.
   */
  ROOM_READY = "room_ready",

  /**
   * This event is triggered when the client fetches friend requests.
   * This is not the same as `FRIEND_ADD`, which is triggered when a new friend is added.
   */
  FRIEND_REQUESTS = "friend_requests",
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
