import { User } from "../structures/user";
import { Room } from "../structures/room";

/**
 * Represents the response for when a user channel has been joined.
 */
export interface UserChannelResponse {
  /**
   * The current user.
   */
  user: Partial<User>;

  /**
   * The friends of the current user.
   */
  friends: Partial<User>[];

  /**
   * The group chats the user is in.
   */
  groups: Room[];

  /**
   * The group chat ids the user is in.
   */
  groups_ids: number[];
}
