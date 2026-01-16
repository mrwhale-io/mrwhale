import { Client } from "../client/client";
import { User } from "./user";
import { UserRole } from "./user-role";

/**
 * Enum representing the different types of rooms available.
 */
export enum RoomType {
  /**
   * Represents a private message room.
   */
  Pm = "pm",

  /**
   * Represents a open group room.
   */
  OpenGroup = "open_group",

  /**
   * Represents a closed group room.
   */
  ClosedGroup = "closed_group",

  /**
   * Represents a viral group room.
   */
  ViralGroup = "viral_group",
}

/**
 * Represents a chat room.
 * This can be a private chat, a closed group, or a fireside group.
 */
export class Room {
  /**
   * The unique identifier of the room.
   */
  readonly id!: number;

  /**
   * The title of the room.
   */
  readonly title!: string;

  /**
   * The fallback title of the room, used when the title is not available.
   * This is typically a list of usernames in the room.
   */
  readonly fallback_title!: string;

  /**
   * The type of the room.
   */
  readonly type!: RoomType;

  /**
   * The user associated with the room (optional).
   */
  readonly user?: User;

  /**
   * The total number of members in the room.
   */
  readonly member_count!: number;

  /**
   * The timestamp of the last message sent in the room.
   */
  readonly last_message_on!: number;

  /**
   * An array of roles assigned to users in the room.
   * Each role defines a specific set of permissions or responsibilities.
   */
  readonly roles!: ReadonlyArray<UserRole>;

  /**
   * Checks if the room is a private chat room.
   *
   * @returns True if the room is a private chat room, otherwise false.
   */
  get isPmRoom(): boolean {
    return this.type === RoomType.Pm;
  }

  /**
   * Checks if the room is a private room.
   * A private room can either be a private message room or a closed group room.
   *
   * @returns True if the room is a private message room or a closed group room, otherwise false.
   */
  get isPrivateRoom(): boolean {
    return this.type === RoomType.Pm || this.type === RoomType.ClosedGroup;
  }

  /**
   * Checks if the room is a group room.
   *
   * @returns True if the room is a group room, otherwise false.
   */
  get isGroupRoom(): boolean {
    return (
      this.type === RoomType.OpenGroup ||
      this.type === RoomType.ClosedGroup ||
      this.type === RoomType.ViralGroup
    );
  }

  /**
   * Gets the list of members in the room.
   * Returns a read-only array to prevent external modification.
   *
   * @returns A read-only array of `User` objects representing the members of the room.
   */
  get members(): ReadonlyArray<User> {
    return this._members;
  }

  /**
   * Gets the unique identifier of the owner of the room.
   * This is only applicable for group rooms.
   *
   * @returns The unique identifier of the owner of the room.
   */
  get owner_id(): number {
    return this._owner_id;
  }

  /**
   * Gets the owner of the room.
   *
   * @returns The owner of the room if the room type is ClosedGroup, otherwise null.
   */
  get owner(): User | null {
    if (this.isGroupRoom && this._members) {
      return (
        this._members.find((member) => member.id === this._owner_id) || null
      );
    }
    return null;
  }

  /**
   * The internal list of members in the room.
   * This property is marked as private to restrict direct access.
   * It is exposed through public getters to ensure controlled access and transformations.
   */
  private _members: User[] = [];

  /**
   * The unique identifier of the owner of the room.
   */
  private _owner_id: number;

  /**
   * @param client The client instance associated with the room.
   * @param data Partial data to initialize the room.
   */
  constructor(public client: Client, data: Partial<Room> = {}) {
    Object.assign(this, data);

    // If the room is a private message room, assign the friend user to the room.
    // Otherwise, assign the group members to the room.
    if (this.isPmRoom) {
      this.user = this.client.chat.friendsList.getByRoom(this.id);
    } else {
      this._owner_id = this.owner_id;
      this.replaceMembers([...data.members]);
    }
  }

  /**
   * Assigns the members of the room.
   *
   * @param members The list of members to assign to the room.
   */
  replaceMembers(members: Partial<User>[]): void {
    if (!Array.isArray(members) || members.length === 0) {
      this.client.logger.warn(
        `Invalid members array provided. Expected an array of User objects.`
      );
      return;
    }

    this.updateMembers(members, true);
  }

  /**
   * Adds a new member to the room.
   *
   * @param member The member to add to the room.
   */
  addMember(member: User): void {
    if (!member) {
      this.client.logger.warn(
        `Invalid member provided. Expected a User object.`
      );
      return;
    }

    // Check if the member already exists in the room
    const existingMember = this._members.find((m) => m.id === member.id);
    if (existingMember) {
      this.client.logger.warn(
        `Member with Id ${member.id} already exists in the room.`
      );
      return;
    }

    this._members.push(member);
  }

  /**
   * Adds multiple members to the room.
   *
   * @param members The list of members to add to the room.
   */
  addMembers(members: Partial<User>[]): void {
    if (!Array.isArray(members) || members.length === 0) {
      this.client.logger.warn(
        `Invalid members array provided. Expected an array of User objects.`
      );
      return;
    }

    // Check if the members already exist in the room
    const existingMemberIds = new Set(this._members.map((m) => m.id));
    const existingMembers = members.filter((member) =>
      existingMemberIds.has(member.id)
    );

    if (existingMembers.length > 0) {
      this.client.logger.warn(
        `Some members already exist in the room (${
          existingMembers.length
        }): ${existingMembers.map((member) => member.id).join(", ")}`
      );
    }

    // Add the new members to the room
    // Filter out existing members to avoid duplicates
    const newMembers = members.filter(
      (member) => !existingMemberIds.has(member.id)
    );

    this.updateMembers(newMembers, false);
  }

  /**
   * Removes a member from the room by their user ID.
   *
   * @param userId The ID of the user to remove.
   * @returns The removed member, or `undefined` if the member was not found.
   */
  removeMember(userId: number): User | undefined {
    const index = this._members.findIndex((member) => member.id === userId);

    if (index === -1) {
      return undefined;
    }

    const [removedMember] = this._members.splice(index, 1);

    return removedMember;
  }

  /**
   * Updates the owner of the room.
   *
   * @param ownerId The ID of the new owner.
   */
  updateOwner(ownerId: number): void {
    if (this._owner_id !== ownerId && this.isGroupRoom) {
      this._owner_id = ownerId;
    }
  }

  /**
   * Updates the members of the room.
   *
   * @param members The list of members to update.
   * @param replace Whether to replace the entire members list or add to it.
   */
  private updateMembers(members: Partial<User>[], replace: boolean): void {
    const newMembers = members.map((member) => new User(member));
    if (replace) {
      this._members = newMembers;
    } else {
      this._members.push(...newMembers);
    }
  }
}
