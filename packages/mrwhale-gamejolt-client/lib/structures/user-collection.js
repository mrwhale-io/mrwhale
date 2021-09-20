"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCollection = void 0;
const user_1 = require("./user");
class UserCollection {
    constructor(users = []) {
        this.collection = [];
        if (users && users.length) {
            for (const user of users) {
                this.collection.push(new user_1.User(user));
            }
        }
    }
    get(input) {
        const userId = typeof input === "number" ? input : input.id;
        return this.collection.find((user) => user.id === userId);
    }
    getByRoom(input) {
        const roomId = typeof input === "number" ? input : input.id;
        return this.collection.find((user) => user.room_id === roomId);
    }
    has(input) {
        return !!this.get(input);
    }
    add(user) {
        // Don't add the same user again.
        if (this.has(user)) {
            return;
        }
        this.collection.push(user);
    }
    remove(input) {
        const userId = typeof input === "number" ? input : input.id;
        const index = this.collection.findIndex((user) => user.id === userId);
        if (index !== -1) {
            this.collection.splice(index, 1);
        }
    }
    update(user) {
        const currentUser = this.get(user);
        if (currentUser) {
            Object.assign(currentUser, user);
        }
    }
}
exports.UserCollection = UserCollection;
