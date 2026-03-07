import { Room } from "../structures/room";
import { KeyedCollection } from "../util/keyed-collection";

/**
 * Represents a collection of chat rooms.
 * This collection allows for efficient retrieval and management of rooms by their unique identifiers.
 */
export class RoomCollection extends KeyedCollection<number, Room> {
  /**
   * Finds a room by its title.
   *
   * @param title The title of the room to find.
   * @returns The room object, or `undefined` if not found.
   */
  findByTitle(title: string): Room | undefined {
    return this.values().find(
      (room) => room.title === title || room.fallback_title === title
    );
  }
}
