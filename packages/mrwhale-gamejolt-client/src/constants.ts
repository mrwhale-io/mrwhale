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

  /**
   * This event is triggered when a user receives a new notification.
   * This is not the same as `NOTIFICATION`, which is triggered for chat notifications.
   */
  USER_NOTIFICATION = "user_notification",
}

/**
 * Organized API endpoints for the Game Jolt site API.
 * Endpoints are grouped by functional domain for better organization and maintainability.
 */
export const Endpoints = {
  /** User blocking and moderation endpoints */
  user: {
    /** Adds a user to the block list. */
    block: `/web/dash/blocks/add`,
    /** Retrieves the list of blocked users. */
    blocks: `/web/dash/blocks`,
    /** Removes a user from the block list. */
    unblock: (id: number): string => `/web/dash/blocks/remove/${id}`,
  },

  /** Friend management and social features */
  friends: {
    /** Retrieves the list of friends. */
    list: `/web/dash/friends`,
    /** Removes a friend. */
    remove: (id: number): string => `/web/dash/friends/remove/${id}`,
    /** Retrieves the list of friend requests. */
    requests: `/web/dash/friends/requests/requests`,
    /** Accepts a friend request. */
    accept: (id: number): string => `/web/dash/friends/requests/accept/${id}`,
    /** Sends a friend request. */
    request: (id: number): string => `/web/dash/friends/requests/add/${id}`,
  },

  /** Game discovery and information */
  games: {
    /** Retrieves detailed game information. */
    info: (id: number): string => `/web/discover/games/${id}`,
    /** Retrieves game overview information. */
    overview: (id: number): string => `/web/discover/games/overview/${id}`,
  },

  /** Comment system */
  comments: {
    /** Saves a comment. */
    save: `/comments/save`,
  },

  /** Media upload and management */
  media: {
    /** Uploads a media item. */
    upload: `/web/dash/media-items/add-one`,
    /** Retrieves media items. */
    items: `/web/dash/media-items`,
  },

  /** Content and resource management */
  content: {
    /** Retrieves a temporary resource. */
    tempResource: (content: ContentContext): string =>
      `/web/content/temp-resource-id/${content}`,
  },

  /** Community features */
  community: {
    /** Retrieves fireside information. */
    fireside: (id: string): string => `/web/fireside/fetch/${id}`,
  },
};

/** The version of the Game Jolt platform the client is compatible with */
export const GJ_PLATFORM_VERSION = "1.33.1";

/** The base Game Jolt domain URL */
export const GAMEJOLT_DOMAIN = "gamejolt.com";

/** The base URL for the Game Jolt website */
export const GAMEJOLT_WEBSITE_URL = `https://${GAMEJOLT_DOMAIN}`;

/** The base URL for Game Jolt's site API endpoints */
export const SITE_API_BASE_URL = `https://${GAMEJOLT_DOMAIN}/site-api`;

/** The base URL for Game Jolt's Grid API endpoints  */
export const GRID_API_BASE_URL = `https://grid.${GAMEJOLT_DOMAIN}/grid`;
