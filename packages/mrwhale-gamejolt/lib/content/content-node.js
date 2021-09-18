"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentNode = void 0;
class ContentNode {
    constructor(content = []) {
        this._content = content;
    }
    get content() {
        return this._content;
    }
    get hasChildren() {
        return this.content.length > 0;
    }
    get lastChild() {
        if (!this.hasChildren) {
            return null;
        }
        return this.content[this.content.length - 1];
    }
    get firstChild() {
        if (!this.hasChildren) {
            return null;
        }
        return this.content[0];
    }
    getChildrenByType(type) {
        const objs = [];
        for (const contentObj of this.content) {
            if (contentObj.type === type) {
                objs.push(contentObj);
            }
            const subObjs = contentObj.getChildrenByType(type);
            objs.push(...subObjs);
        }
        return objs;
    }
    getMarks(type) {
        const textObjs = this.getChildrenByType("text");
        const marks = [];
        for (const textObj of textObjs) {
            marks.push(...textObj.marks.filter((m) => m.type === type));
        }
        return marks;
    }
    appendChild(child) {
        this._content.push(child);
    }
    /**
     * Returns a uniform length computed by the children and their content.
     * Each node type can define its own way to compute its length.
     */
    getLength() {
        let length = 0;
        for (const contentObj of this._content) {
            length += contentObj.getLength();
        }
        return length;
    }
}
exports.ContentNode = ContentNode;
