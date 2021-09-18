"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequest = void 0;
class FriendRequest {
    constructor(client, data) {
        this.client = client;
        Object.assign(this, data);
    }
    accept() {
        return new Promise((resolve) => {
            this.client.api.friendAccept(this.id).then((response) => {
                resolve(response.success);
            });
        });
    }
}
exports.FriendRequest = FriendRequest;
