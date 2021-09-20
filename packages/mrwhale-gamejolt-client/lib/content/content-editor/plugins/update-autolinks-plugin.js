"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_model_1 = require("prosemirror-model");
const prosemirror_state_1 = require("prosemirror-state");
const url_detector_1 = require("./url-detector");
const content_editor_1 = require("../content-editor");
class UpdateAutolinkPlugin extends prosemirror_state_1.Plugin {
    constructor(schema, capabilities) {
        super({});
        this.schema = schema;
        this.capabilities = capabilities;
        this.spec.appendTransaction = this.appendTransaction;
    }
    appendTransaction(_transactions, oldState, newState) {
        const tr = newState.tr;
        const mentionMarkType = this.schema.marks.mention;
        const tagMarkType = this.schema.marks.tag;
        const linkMarkType = this.schema.marks.link;
        const paragraphs = this.getParagraphs(tr.doc);
        // @username should create a mention
        // #tag should create a tag
        // c/community should link a community
        // urls should be autolinked
        for (const paragraph of paragraphs) {
            const paragraphPos = content_editor_1.ContentEditor.findNodePosition(newState, paragraph);
            // Check if the paragraph changed compared to the last state.
            // -1 to not include the doc node.
            if (oldState.doc.nodeSize - 1 >= paragraphPos) {
                const oldParagraph = oldState.doc.nodeAt(paragraphPos);
                if (oldParagraph instanceof prosemirror_model_1.Node && oldParagraph.eq(paragraph)) {
                    continue;
                }
            }
            if (this.capabilities.mention) {
                tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, mentionMarkType);
            }
            if (this.capabilities.tag) {
                tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, tagMarkType);
            }
            if (this.capabilities.textLink) {
                this.removeAutolinkMarks(tr, paragraphPos, paragraph);
            }
            // We split the paragraph's inline nodes into text cells.
            // These text cells contain only text nodes and are split at positions that hold inline nodes that aren't text.
            // Example: @Hello🦀@World, where the emoji is a gj-emoji inline node.
            // This would produce two text cells, one with "@Hello", one with "@World".
            const cells = this.getTextCells(paragraph);
            for (const cell of cells) {
                // These have to be processed in this order, because links have to have preceedens over mentions:
                // `gamejolt.com/@user` would become an autolink, and not a mention when processing links first.
                if (this.capabilities.textLink) {
                    this.processLinks(tr, cell, linkMarkType, paragraphPos);
                }
                if (this.capabilities.mention) {
                    this.processMentions(tr, cell, mentionMarkType, paragraphPos);
                }
                if (this.capabilities.tag) {
                    this.processTags(tr, cell, tagMarkType, paragraphPos);
                }
            }
        }
        return tr;
    }
    /**
     * Checks whether the given range (from - to) has one of the three mark types attached to it:
     *  - mention
     *  - tag
     *  - link
     */
    rangeHasLinks(tr, from, to) {
        const markTypes = [
            this.schema.marks.mention,
            this.schema.marks.tag,
            this.schema.marks.link,
        ];
        for (const markType of markTypes) {
            if (tr.doc.rangeHasMark(from, to, markType)) {
                return true;
            }
        }
        return false;
    }
    processTags(tr, cell, markType, paragraphPos) {
        const matches = [];
        const regex = /(?:^|[^a-z0-9_])(#[a-z0-9_]{1,30})/gi;
        let cellMatch = regex.exec(cell.text);
        while (cellMatch !== null) {
            // Make sure the tag starts with the '#' character.
            const tagIndex = cellMatch[0].indexOf("#");
            cellMatch[0] = cellMatch[0].substr(tagIndex);
            cellMatch.index += tagIndex;
            matches.push({
                index: cell.index + cellMatch.index + 1,
                match: cellMatch[0],
            });
            cellMatch = regex.exec(cell.text);
        }
        for (const match of matches) {
            const from = paragraphPos + match.index;
            const to = from + match.match.length;
            // Make sure to only apply a tag mark if the given range does not already have a link/mention/tag mark on it.
            if (!this.rangeHasLinks(tr, from, to)) {
                const mark = markType.create({ tag: match.match.substr(1) });
                tr.addMark(from, to, mark);
            }
        }
    }
    processMentions(tr, cell, markType, paragraphPos) {
        const matches = [];
        const regex = /(?:^|[^\w@_-])(@[\w_-]{3,30})/gi;
        let cellMatch = regex.exec(cell.text);
        while (cellMatch !== null) {
            // Make sure the mention starts with the '@' character.
            const atIndex = cellMatch[0].indexOf("@");
            cellMatch[0] = cellMatch[0].substr(atIndex);
            cellMatch.index += atIndex;
            matches.push({
                index: cell.index + cellMatch.index + 1,
                match: cellMatch[0],
            });
            cellMatch = regex.exec(cell.text);
        }
        for (const match of matches) {
            const from = paragraphPos + match.index;
            const to = from + match.match.length;
            // Make sure to only apply a mention mark if the given range does not already have a link/mention/tag mark on it.
            if (!this.rangeHasLinks(tr, from, to)) {
                const mark = markType.create({ username: match.match.substr(1) });
                tr.addMark(from, to, mark);
            }
        }
    }
    processLinks(tr, cell, markType, paragraphPos) {
        const matches = url_detector_1.UrlDetector.detect(cell.text, cell.index + 1); // +1 to skip the paragraph node index
        for (const match of matches) {
            const from = paragraphPos + match.index;
            const to = from + match.match.length;
            // Make sure to only apply a link mark if the given range does not already have a link/mention/tag mark on it.
            if (!this.rangeHasLinks(tr, from, to)) {
                const mark = markType.create({
                    href: match.match,
                    title: match.match,
                    autolink: true,
                });
                tr.addMark(from, to, mark);
            }
        }
    }
    removeAutolinkMarks(tr, paragraphPos, paragraph) {
        const autolinkMarks = [];
        paragraph.descendants((node) => {
            if (node.isText) {
                autolinkMarks.push(...node.marks.filter((m) => m.type.name === "link" && m.attrs.autolink));
            }
        });
        for (const autolinkMark of autolinkMarks) {
            tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, autolinkMark);
        }
    }
    getParagraphs(parent) {
        const paragraphs = [];
        for (let i = 0; i < parent.childCount; i++) {
            const child = parent.child(i);
            if (child.type.name === "paragraph") {
                paragraphs.push(child);
            }
            else {
                paragraphs.push(...this.getParagraphs(child));
            }
        }
        return paragraphs;
    }
    getTextCells(parent) {
        const cells = [];
        let currentCell = { index: 0, text: "" };
        for (let i = 0; i < parent.childCount; i++) {
            const child = parent.child(i);
            if (child.isText && child.marks.every((m) => m.type.name !== "code")) {
                currentCell.text += child.text;
            }
            else {
                if (currentCell.text.length > 0) {
                    cells.push(currentCell);
                }
                currentCell = {
                    index: currentCell.index + child.nodeSize + currentCell.text.length,
                    text: "",
                };
            }
        }
        if (currentCell.text.length > 0) {
            cells.push(currentCell);
        }
        return cells;
    }
}
exports.default = UpdateAutolinkPlugin;
