"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const game_1 = require("./game");
const user_1 = require("./user");
const fireside_post_1 = require("./fireside-post");
const comment_1 = require("./comment");
class Notification {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(data) {
        Object.assign(this, data);
        if (data.from_resource === "User" && data.from_resource_id) {
            this.from_model = new user_1.User(data.from_resource_model);
        }
        if (data.to_resource === "Game") {
            this.to_model = new game_1.Game(data.to_resource_model);
        }
        else if (data.to_resource === "User") {
            this.to_model = new user_1.User(data.to_resource_model);
        }
        else if (data.to_resource === "Fireside_Post") {
            this.to_model = new fireside_post_1.FiresidePost(data.to_resource_model);
        }
        if (this.type === "post-add") {
            this.action_model = new fireside_post_1.FiresidePost(data.action_resource_model);
        }
        else if (this.type === "comment-add-object-owner") {
            this.action_model = new comment_1.Comment(data.action_resource_model);
        }
    }
}
exports.Notification = Notification;
