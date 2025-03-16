import { Block } from "../structures/block";

/**
 * Represents a list of blocked users and communities queried from the API.
 */
export interface BlockedUsersPayload {
  /**
   * A list of blocked users and communities.
   */
  blocks: Partial<Block>[];
}
