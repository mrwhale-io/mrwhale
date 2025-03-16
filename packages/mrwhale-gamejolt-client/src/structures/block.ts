import { User } from "./user";

/**
 * Represents a user block on Game Jolt.
 */
export class Block {
  /**
   * The block id.
   */
  id!: number;

  /**
   * The timestamp when the user was blocked.
   */
  blocked_on!: number;

  /**
   * The timestamp when the block expires.
   */
  expires_on!: number;

  /**
   * The reason for the block.
   */
  reason!: string;

  /**
   * The resource type that was blocked.
   */
  resource!: "Community" | "User";

  /**
   * The resource id that was blocked.
   */
  resource_id!: number;

  /**
   * The user that was blocked.
   */
  user!: User;

  constructor(data: Partial<Block>) {
    Object.assign(this, data);

    if (data.user) {
      this.user = new User(data.user);
    }
  }
}
