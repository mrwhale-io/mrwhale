import { User } from "../structures/user";
import { MemberAddPayload, OwnerSyncPayload } from "./payloads";

/**
 * Event data interfaces for the Game Jolt client.
 * These types are used across Client, RoomChannel, UserChannel, and other components
 * to ensure consistency and type safety for event handling.
 */

/** Data emitted when a user's information is updated in a room. */
export interface UserUpdatedEventData {
  /** The ID of the room where the user was updated. */
  room_id: number;
  /** The updated user object. */
  user: User;
}

/**
 * Data emitted when new members join a group room.
 * Extends the existing MemberAddPayload with room_id for consistency.
 */
export interface MemberAddEventData extends MemberAddPayload {
  /** The ID of the room where members were added. */
  room_id: number;
}

/**
 * Data emitted when a member leaves a group room.
 * Uses the existing MemberLeavePayload structure with additional room context.
 */
export interface MemberLeaveEventData {
  /** The ID of the room where the member left. */
  room_id: number;
  /** The user who left the room. */
  member: User;
}

/**
 * Data emitted when a group room's owner changes.
 * Extends the existing OwnerSyncPayload with room_id for consistency.
 */
export interface OwnerSyncEventData extends OwnerSyncPayload {
  /** The ID of the room where ownership changed. */
  room_id: number;
}

/** Union type of all possible event names for type safety. */
export type ClientEventName =
  | "message"
  | "notification"
  | "user_updated"
  | "friend_updated"
  | "friend_add"
  | "friend_remove"
  | "you_updated"
  | "member_add"
  | "member_leave"
  | "owner_sync"
  | "user_notification"
  | "chat_ready"
  | "room_ready"
  | "group_add"
  | "group_leave"
  | "friend_requests";

// Re-export existing payload types for easy access
export type {
  MemberAddPayload,
  MemberLeavePayload,
  OwnerSyncPayload,
  FriendRemovePayload,
  GroupAddPayload,
} from "./payloads";
