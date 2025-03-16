import { Client } from "../client/client";
import { User } from "./user";

/**
 * Represents a friend request in the system.
 */
export class FriendRequest {
  /**
   * The ID of the friend request.
   */
  id: number;

  /**
   * The ID of the user who sent the friend request.
   */
  user_id: number;

  /**
   * The ID of the user who received the friend request.
   */
  target_user_id: number;

  /**
   * The user who sent the friend request.
   */
  user: User;

  /**
   * The user who received the friend request.
   */
  target_user: User;

  /**
   * The timestamp when the friend request was created.
   */
  created_on: Date;

  /**
   * The timestamp when the friend request was accepted.
   */
  accepted_on: Date;

  /**
   * The timestamp when the friend request was declined.
   */
  declined_on: Date;

  /**
   * The state of the friend request.
   */
  state: number;

  /**
   * The client instance that is used to interact with the GameJolt API.
   */
  readonly client: Client;

  constructor(client: Client, data: Partial<FriendRequest>) {
    this.client = client;
    Object.assign(this, data);
  }

  /**
   * Accepts the friend request.
   * @returns A promise that resolves to a boolean indicating success.
   */
  async accept(): Promise<boolean> {
    try {
      return await this.client.api.friends.acceptFriendRequest(this.id);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      return false;
    }
  }
}
