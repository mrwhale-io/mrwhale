"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiresidePost = void 0;
const game_1 = require("./game");
const user_1 = require("./user");
class FiresidePost {
    constructor(data) {
        Object.assign(this, data);
        if (data.user) {
            this.user = new user_1.User(data.user);
        }
        if (data.game) {
            this.game = new game_1.Game(data.game);
        }
    }
}
exports.FiresidePost = FiresidePost;
