export type UserRoles = "owner" | "moderator" | "user";

/**
 * Represents a user chat role on Game Jolt.
 */
export class UserRole {
  /**
   * The unique identifier of the user associated with this role.
   */
  readonly user_id: number;
  /**
   * Represents the role of a chat user.
   * This is a read-only property of type `UserRole`.
   */
  readonly role: UserRoles;

  constructor(data: Partial<UserRole> = {}) {
    Object.assign(this, data);
  }
}
