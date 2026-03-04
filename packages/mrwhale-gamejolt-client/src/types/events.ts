/**
 * Consolidated event data types for the Game Jolt client.
 * These types are used across Client, RoomChannel, UserChannel, and other components
 * to ensure consistency and avoid duplication.
 */

// Re-export existing payload types for easy access
export { MemberAddPayload } from "./member-add-payload";
export { MemberLeavePayload } from "./member-leave-payload";
export { OwnerSyncPayload } from "./owner-sync-payload";
export { FriendRemovePayload } from "./friend-remove-payload";
export { GroupAddPayload } from "./group-add-payload";
export { UserChannelResponse } from "./user-channel-response";

// Re-export client event types
export type {
  UserUpdatedEventData,
  MemberAddEventData,
  MemberLeaveEventData,
  OwnerSyncEventData,
  ClientEventName
} from "../client/client";