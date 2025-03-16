/**
 * Payload for owner sync event.
 * This event is triggered when the owner of a chat room changes.
 */
export interface OwnerSyncPayload {
  /**
   * The user id of the new room owner.
   */
  owner_id: number;
}
