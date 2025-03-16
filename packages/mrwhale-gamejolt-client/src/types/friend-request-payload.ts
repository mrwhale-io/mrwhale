import { FriendRequest } from "../structures/friend-request";

/**
 * Represents a friend request payload.
 */
export interface FriendRequestPayload {
  /**
   * A list of friend requests for the client user.
   */
  requests: Partial<FriendRequest[]>;
}
