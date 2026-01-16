import { User } from "./user";

/**
 * Represents a user block on Game Jolt.
 */
export class Block {
  /**
   * The block id.
   */
  readonly id!: number;

  /**
   * The timestamp when the user was blocked.
   */
  readonly blocked_on!: number;

  /**
   * The timestamp when the block expires.
   */
  readonly expires_on!: number;

  /**
   * The reason for the block.
   */
  readonly reason!: string;

  /**
   * The resource type that was blocked.
   */
  readonly resource!: "Community" | "User";

  /**
   * The resource id that was blocked.
   */
  readonly resource_id!: number;

  /**
   * The user that was blocked.
   */
  readonly user!: User;

  constructor(data: Partial<Block>) {
    Object.assign(this, data);

    if (data.user) {
      this.user = new User(data.user);
    }
  }
}
