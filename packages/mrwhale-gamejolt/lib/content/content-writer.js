"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentWriter = void 0;
const content_object_1 = require("./content-object");
const mark_object_1 = require("./mark-object");
class ContentWriter {
    constructor(doc) {
        this._doc = doc;
    }
    ensureParagraph() {
        let p;
        if (this._doc.lastChild === null ||
            (this._doc.lastChild instanceof content_object_1.ContentObject &&
                this._doc.lastChild.type !== "paragraph")) {
            p = new content_object_1.ContentObject("paragraph");
            this._doc.appendChild(p);
        }
        else {
            p = this._doc.lastChild;
        }
        return p;
    }
    appendTag(tag) {
        const tagObj = new content_object_1.ContentObject("text");
        tagObj.text = "#" + tag;
        const tagMark = new mark_object_1.MarkObject("tag");
        tagMark.attrs.tag = tag;
        tagObj.marks.push(tagMark);
        const parentParagraph = this.ensureParagraph();
        if (parentParagraph.lastChild instanceof content_object_1.ContentObject) {
            if (parentParagraph.lastChild.type === "text") {
                parentParagraph.lastChild.text += " ";
            }
            else {
                const t = new content_object_1.ContentObject("text");
                t.text = " ";
                parentParagraph.appendChild(t);
            }
        }
        parentParagraph.appendChild(tagObj);
    }
}
exports.ContentWriter = ContentWriter;
