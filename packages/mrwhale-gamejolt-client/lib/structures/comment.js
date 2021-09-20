"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const user_1 = require("./user");
class Comment {
    constructor(data) {
        Object.assign(this, data);
        if (data.user) {
            this.user = new user_1.User(data.user);
        }
    }
}
exports.Comment = Comment;
