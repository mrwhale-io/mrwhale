import { Room } from "../structures/room";
import { FriendRequest } from "../structures/friend-request";
import { User } from "../structures/user";
import { Block } from "../structures/block";

/**
 * Payload interfaces for the Game Jolt client.
 * These types represent the structure of data received from the Game Jolt API
 * for various operations such as friend management, group management, and blocking.
 */

/** Payload for removing a friend. */
export interface FriendRemovePayload {
  /** The user id of the friend to remove. */
  user_id: number;
}

/** API payload for accepting a friend request. */
export interface FriendRequestAcceptPayload {
  /** Whether the friend request was successful. */
  success: boolean;
}

/** Represents a friend request payload. */
export interface FriendRequestPayload {
  /** A list of friend requests for the client user. */
  requests: Partial<FriendRequest[]>;
}

/** Represents a group add payload. */
export interface GroupAddPayload {
  /** The room to add. */
  room: Partial<Room>;
}

/** Represents a member add payload. */
export interface MemberAddPayload {
  /** The members to add. */
  members: User[];
}

/** Payload for when a member leaves a chat room. */
export interface MemberLeavePayload {
  /** The user id of the member that left. */
  user_id: number;
}

/**
 * Payload for owner sync event.
 * This event is triggered when the owner of a chat room changes.
 */
export interface OwnerSyncPayload {
  /** The user id of the new room owner. */
  owner_id: number;
}

/** Represents a list of blocked users and communities queried from the API. */
export interface BlockedUsersPayload {
  /** A list of blocked users and communities. */
  blocks: Partial<Block>[];
}

/** Represents a block payload from the API. */
export interface BlockPayload {
  /** The block that was created. */
  block: Partial<Block>;

  /** Whether the block was successful. */
  success: boolean;
}

/** Payload for unblocking a user. */
export interface UnBlockPayload {
  /** Whether the unblock was successful. */
  success: boolean;
}
