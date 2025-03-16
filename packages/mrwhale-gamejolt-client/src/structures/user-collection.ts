import { Room } from "./room";
import { User } from "./user";

/**
 * Represents a collection of users.
 */
export class UserCollection {
  /**
   * The collection of users.
   */
  collection: User[] = [];

  /**
   * @param users - An optional array of user data to initialize the collection.
   */
  constructor(users: any[] = []) {
    if (users && users.length) {
      for (const user of users) {
        this.collection.push(new User(user));
      }
    }
  }

  /**
   * Retrieves a user from the collection by their ID or User object.
   * @param input - The user ID or User object.
   * @returns The user if found, otherwise undefined.
   */
  get(input: number | User): User {
    const userId = typeof input === "number" ? input : input.id;
    return this.collection.find((user) => user.id === userId);
  }

  /**
   * Retrieves a user from the collection by their room ID or Room object.
   * @param input - The room ID or Room object.
   * @returns The user if found, otherwise undefined.
   */
  getByRoom(input: number | Room): User {
    const roomId = typeof input === "number" ? input : input.id;
    return this.collection.find((user) => user.room_id === roomId);
  }

  /**
   * Checks if a user exists in the collection by their ID or User object.
   * @param input - The user ID or User object.
   * @returns True if the user exists, otherwise false.
   */
  has(input: number | User): boolean {
    return !!this.get(input);
  }

  /**
   * Adds a user to the collection.
   * @param user - The user to add.
   */
  add(user: User): void {
    // Don't add the same user again.
    if (this.has(user)) {
      return;
    }

    this.collection.push(user);
  }

  /**
   * Removes a user from the collection by their ID or User object.
   * @param input The user ID or User object.
   */
  remove(input: number | User): void {
    const userId = typeof input === "number" ? input : input.id;
    const index = this.collection.findIndex((user) => user.id === userId);

    if (index !== -1) {
      this.collection.splice(index, 1);
    }
  }

  /**
   * Updates a user in the collection.
   * @param user The user with updated data.
   */
  update(user: User): void {
    const currentUser = this.get(user);
    if (currentUser) {
      Object.assign(currentUser, user);
    }
  }
}
