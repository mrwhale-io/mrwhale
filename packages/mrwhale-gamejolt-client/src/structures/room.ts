import { User } from "./user";

/**
 * Enum representing the different types of rooms available.
 */
export enum RoomType {
  /**
   * Represents a private message room.
   */
  Pm = "pm",

  /**
   * Represents a closed group room.
   */
  ClosedGroup = "closed_group",

  /**
   * Represents a fireside group room.
   */
  FiresideGroup = "fireside_group",
}

/**
 * Represents a chat room.
 * This can be a private chat, a closed group, or a fireside group.
 */
export class Room {
  /**
   * The unique identifier of the room.
   */
  id!: number;

  /**
   * The title of the room.
   */
  title!: string;

  /**
   * The type of the room.
   */
  type!: RoomType;

  /**
   * The user associated with the room (optional).
   */
  user?: User;

  /**
   * The description of the room.
   */
  description!: string;

  /**
   * The list of members in the room.
   */
  members: User[] = [];

  /**
   * The unique identifier of the owner of the room.
   */
  owner_id!: number;

  /**
   * Gets the owner of the room.
   *
   * @returns The owner of the room if the room type is ClosedGroup, otherwise null.
   */
  get owner(): User {
    return this.type === RoomType.ClosedGroup
      ? this.members.find((member) => member.id === this.owner_id)
      : null;
  }

  /**
   * @param data Partial data to initialize the room.
   */
  constructor(data: Partial<Room> = {}) {
    Object.assign(this, data);
  }
}
