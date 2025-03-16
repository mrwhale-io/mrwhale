import { User } from "../structures/user";

/**
 * Represents a member add payload.
 */
export interface MemberAddPayload {
  /**
   * The members to add.
   */
  members: User[];
}
