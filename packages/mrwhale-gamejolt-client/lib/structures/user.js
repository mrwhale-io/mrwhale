"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(data = {}) {
        Object.assign(this, data);
        if (typeof this.created_on === "number" ||
            typeof this.created_on === "string") {
            this.created_on = new Date(this.created_on);
        }
    }
}
exports.User = User;
