"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const user_1 = require("./user");
const content_document_1 = require("../content/content-document");
class Message {
    constructor(client, data = {}) {
        this.client = client;
        this.replied = false;
        Object.assign(this, data);
        this.client = client;
        if (typeof this.logged_on === "number" ||
            typeof this.logged_on === "string") {
            this.logged_on = new Date(this.logged_on);
        }
        if (data.user) {
            this.user = new user_1.User(data.user);
        }
    }
    get textContent() {
        const doc = content_document_1.ContentDocument.fromJson(this.content);
        let result = "";
        for (const outerContent of doc.content) {
            for (const innerContent of outerContent.content) {
                if (innerContent.text) {
                    result += innerContent.text;
                }
            }
        }
        return result;
    }
    get mentions() {
        const doc = content_document_1.ContentDocument.fromJson(this.content);
        const mentions = [];
        for (const hydrationEntry of doc.hydration) {
            if (hydrationEntry.type === "username") {
                mentions.push(new user_1.User(hydrationEntry.data));
            }
        }
        return mentions;
    }
    get isMentioned() {
        return this.mentions.some((mention) => mention.id === this.client.userId);
    }
    get isRoomOwner() {
        return (this.client.chat.activeRooms[this.room_id] &&
            this.user.id === this.client.chat.activeRooms[this.room_id].owner_id);
    }
    /**
     * Reply directly to this message.
     *
     * @param message The content of the message.
     */
    reply(message) {
        if (this.user.id === this.client.chat.currentUser.id) {
            return;
        }
        return new Promise((resolve, reject) => {
            this.client.chat
                .sendMessage(message, this.room_id)
                .receive("error", reject)
                .receive("ok", (data) => resolve(new Message(this.client, data)));
        });
    }
    /**
     * Edit the message content.
     *
     * @param message The content of the message
     */
    edit(message) {
        if (this.user.id !== this.client.chat.currentUser.id) {
            return;
        }
        this.client.chat.editMessage(message, this);
    }
    toString() {
        return this.textContent;
    }
}
exports.Message = Message;
