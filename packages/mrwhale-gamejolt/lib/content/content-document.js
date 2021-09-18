"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentDocument = void 0;
const content_node_1 = require("./content-node");
const content_object_1 = require("./content-object");
const GJ_FORMAT_VERSION = "1.0.0";
class ContentDocument extends content_node_1.ContentNode {
    constructor(context, content = []) {
        super(content);
        this.version = GJ_FORMAT_VERSION;
        this.createdOn = Date.now();
        this.context = context;
        this.hydration = [];
    }
    static fromJson(json) {
        if (!json) {
            throw new Error("Empty json provided.");
        }
        const jsonObj = JSON.parse(json);
        const context = jsonObj.context;
        const content = [];
        if (Array.isArray(jsonObj.content)) {
            for (const subJsonObj of jsonObj.content) {
                content.push(content_object_1.ContentObject.fromJsonObj(subJsonObj));
            }
        }
        const doc = new ContentDocument(context, content);
        doc.version = jsonObj.version;
        doc.createdOn = jsonObj.createdOn;
        if (Array.isArray(jsonObj.hydration)) {
            doc.hydration = jsonObj.hydration;
        }
        else {
            doc.hydration = [];
        }
        return doc;
    }
    toJson() {
        const data = {
            version: this.version,
            createdOn: this.createdOn,
            context: this.context,
            content: this.content.map((i) => i.toJsonObj()),
            hydration: [],
        };
        return JSON.stringify(data);
    }
    /**
     * Determines whether there is any "content" in this document.
     * This disregards empty objects like paragraphs with only empty text nodes or list items with empty paragraphs.
     */
    get hasContent() {
        for (const child of this.content) {
            if (child.hasContent) {
                return true;
            }
        }
        return false;
    }
    getLength() {
        return super.getLength() - 1;
    }
    /**
     * Ensures that the last content object is a paragraph.
     *
     * This is needed only because the content editor appends a paragraph node at the end of the document.
     * That is done to allow the user to click into it to use the + menu/easily add an empty paragraph.
     */
    ensureEndParagraph() {
        if (this.content.length === 0 ||
            this.content[this.content.length - 1].type !== "paragraph") {
            const p = new content_object_1.ContentObject("paragraph");
            this.appendChild(p);
        }
    }
}
exports.ContentDocument = ContentDocument;
