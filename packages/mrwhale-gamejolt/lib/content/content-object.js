"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentObject = void 0;
const link_markspec_1 = require("./content-editor/schemas/specs/marks/link-markspec");
const content_node_1 = require("./content-node");
const mark_object_1 = require("./mark-object");
class ContentObject extends content_node_1.ContentNode {
    constructor(type) {
        super();
        this.type = type;
        this.text = null;
        this.attrs = {};
        this.marks = [];
    }
    get hasContent() {
        // hr and hard break do not count as "content".
        switch (this.type) {
            case "text":
                return typeof this.text === "string" && this.text.length > 0;
            // The following types are automatically considered content:
            case "gjEmoji":
            case "embed":
            case "mediaItem":
            case "gif":
                return true;
        }
        for (const child of this.content) {
            if (child.hasContent) {
                return true;
            }
        }
        return false;
    }
    static fromJsonObj(jsonObj) {
        const type = jsonObj.type;
        const obj = new ContentObject(type);
        if (typeof jsonObj.text === "string") {
            obj.text = jsonObj.text;
        }
        else {
            obj.text = null;
        }
        if (jsonObj.attrs === undefined) {
            obj.attrs = {};
        }
        else {
            obj.attrs = jsonObj.attrs;
        }
        obj._content = [];
        if (Array.isArray(jsonObj.content)) {
            for (const subJsonObj of jsonObj.content) {
                obj.appendChild(ContentObject.fromJsonObj(subJsonObj));
            }
        }
        obj.marks = [];
        if (Array.isArray(jsonObj.marks)) {
            for (const subJsonObj of jsonObj.marks) {
                obj.marks.push(mark_object_1.MarkObject.fromJsonObj(subJsonObj));
            }
        }
        return obj;
    }
    toJsonObj() {
        const jsonObj = {};
        jsonObj.type = this.type;
        if (this.attrs !== undefined && Object.keys(this.attrs).length > 0) {
            jsonObj.attrs = this.attrs;
        }
        if (this.text !== null) {
            jsonObj.text = this.text;
        }
        if (this.content.length > 0) {
            jsonObj.content = this.content.map((i) => i.toJsonObj());
        }
        if (this.marks.length > 0) {
            jsonObj.marks = this.marks.map((i) => i.toJsonObj());
        }
        return jsonObj;
    }
    getLength() {
        let length = 0;
        switch (this.type) {
            case "text":
                if (this.marks.some((m) => m.type === "link")) {
                    length += link_markspec_1.LINK_LENGTH;
                }
                else if (this.text) {
                    length += this.text.length;
                }
                break;
            case "listItem": // Include a char for the 1./* at the beginning
            case "gjEmoji":
            case "hardBreak":
            case "hr":
            case "paragraph":
            case "gif":
                length++;
                break;
            case "embed":
                length += this.attrs.source.length;
                break;
            case "mediaItem":
                length += this.attrs.caption.length + 1;
                break;
        }
        length += super.getLength();
        return length;
    }
}
exports.ContentObject = ContentObject;
