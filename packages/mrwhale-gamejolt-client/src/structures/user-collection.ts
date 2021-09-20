import { Room } from "./room";
import { User } from "./user";

export class UserCollection {
  collection: User[] = [];

  constructor(users: any[] = []) {
    if (users && users.length) {
      for (const user of users) {
        this.collection.push(new User(user));
      }
    }
  }

  get(input: number | User): User {
    const userId = typeof input === "number" ? input : input.id;
    return this.collection.find((user) => user.id === userId);
  }

  getByRoom(input: number | Room): User {
    const roomId = typeof input === "number" ? input : input.id;
    return this.collection.find((user) => user.room_id === roomId);
  }

  has(input: number | User): boolean {
    return !!this.get(input);
  }

  add(user: User): void {
    // Don't add the same user again.
    if (this.has(user)) {
      return;
    }

    this.collection.push(user);
  }

  remove(input: number | User): void {
    const userId = typeof input === "number" ? input : input.id;
    const index = this.collection.findIndex((user) => user.id === userId);

    if (index !== -1) {
      this.collection.splice(index, 1);
    }
  }

  update(user: User): void {
    const currentUser = this.get(user);
    if (currentUser) {
      Object.assign(currentUser, user);
    }
  }
}
