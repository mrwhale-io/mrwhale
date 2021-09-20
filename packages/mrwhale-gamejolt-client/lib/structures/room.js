"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.RoomType = void 0;
const user_1 = require("./user");
var RoomType;
(function (RoomType) {
    RoomType["Pm"] = "pm";
    RoomType["ClosedGroup"] = "closed_group";
    RoomType["FiresideGroup"] = "fireside_group";
})(RoomType = exports.RoomType || (exports.RoomType = {}));
class Room {
    constructor(data = {}) {
        this.members = [];
        Object.assign(this, data);
        if (data.members) {
            this.members = data.members.map((member) => new user_1.User(member));
        }
    }
    get owner() {
        return this.type === RoomType.ClosedGroup
            ? this.members.find((member) => member.id === this.owner_id)
            : null;
    }
}
exports.Room = Room;
