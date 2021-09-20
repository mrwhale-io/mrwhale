import { Room } from "./room";
import { User } from "./user";
export declare class UserCollection {
    collection: User[];
    constructor(users?: any[]);
    get(input: number | User): User;
    getByRoom(input: number | Room): User;
    has(input: number | User): boolean;
    add(user: User): void;
    remove(input: number | User): void;
    update(user: User): void;
}
