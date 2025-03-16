import { Room } from "../structures/room";

/**
 * Represents a group add payload.
 */
export interface GroupAddPayload {
  /**
   * The room to add.
   */
  room: Partial<Room>;
}
