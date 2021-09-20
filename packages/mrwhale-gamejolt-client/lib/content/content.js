"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
const content_editor_schema_1 = require("./content-editor/schemas/content-editor-schema");
const prosemirror_state_1 = require("prosemirror-state");
const content_editor_1 = require("./content-editor/content-editor");
const content_context_1 = require("./content-context");
const uuidv4_1 = require("../util/uuidv4");
const content_markdown_parser_1 = require("./content-markdown-parser");
const update_autolinks_plugin_1 = require("./content-editor/plugins/update-autolinks-plugin");
const content_document_1 = require("./content-document");
const content_object_1 = require("./content-object");
const content_writer_1 = require("./content-writer");
/**
 * Builds content editor content.
 */
class Content {
    constructor(context = "chat-message", content = "") {
        this.context = context;
        this.capabilities = content_context_1.ContextCapabilities.getForContext(context);
        this.schema = content_editor_schema_1.generateSchema(this.capabilities);
        this.state = prosemirror_state_1.EditorState.create({
            doc: content_markdown_parser_1.contentMarkdownParser(this.schema).parse(content),
            plugins: [new update_autolinks_plugin_1.default(this.schema, this.capabilities)],
        });
    }
    /**
     * Create a text node in the schema. Empty text nodes are not allowed.
     * @param content The text content.
     * @param [marks] Any marks to add.
     */
    textNode(content, marks) {
        return this.state.schema.text(content, marks);
    }
    /**
     * Create an auto link mark.
     * @param href The address of the link.
     * @param title The title of the link.
     */
    autoLink(href, title) {
        return this.state.schema.mark("link", {
            href,
            title,
            autolink: true,
        });
    }
    /**
     * Create a user mention mark.
     * @param username The username of the user to mention.
     */
    mention(username) {
        return this.state.schema.mark("mention", { username });
    }
    /**
     * Create a code mark.
     * @param text The text content of the code.
     */
    code(text) {
        return this.state.schema.mark("code", { text });
    }
    /**
     * Insert a paragraph node.
     * @param [content] The nodes to contain within paragraph node.
     */
    paragraphNode(content) {
        return this.state.schema.nodes.paragraph.create({}, content);
    }
    /**
     * Insert a list item node.
     * @param [content] The nodes to contain within list item node.
     */
    listItemNode(content) {
        return this.state.schema.nodes.listItem.create({}, content);
    }
    /**
     * Insert a text node.
     * @param content The content of the text node.
     * @param [marks] Any marks to include.
     */
    insertText(content, marks) {
        const node = this.schema.text(content, marks);
        this.insertNewNode(node);
        return this;
    }
    /**
     * Insert a media upload node.
     * @param mediaItem The media item to insert.
     */
    insertImage(mediaItem) {
        const uploadId = uuidv4_1.uuidv4();
        const newNode = this.schema.nodes.mediaUpload.create({
            uploadId,
        });
        this.insertNewNode(newNode);
        const tr = this.state.tr;
        const nodePos = this.findTargetNodePos(uploadId);
        tr.setNodeMarkup(nodePos, this.state.schema.nodes.mediaItem, {
            id: mediaItem.id,
            width: mediaItem.width,
            height: mediaItem.height,
            align: "center",
            caption: "",
        });
        this.state = this.state.apply(tr);
        return this;
    }
    /**
     * Insert a code block node.
     * @param [content] The nodes to contain within code block node.
     */
    insertCodeBlock(content) {
        let contentNode;
        if (typeof content === "string") {
            contentNode = this.textNode(content);
        }
        else {
            contentNode = content;
        }
        const node = this.schema.nodes.codeBlock.create({}, contentNode);
        this.insertNewNode(node);
        return this;
    }
    /**
     * Insert a bullet list node.
     * @param items The nodes to contain within bullet list node.
     */
    insertBulletList(items) {
        const listNode = this.state.schema.nodes.bulletList.create({}, items);
        this.insertNewNode(listNode);
        return this;
    }
    /**
     * Insert a ordered list node.
     * @param items The nodes to contain within ordered list node.
     */
    insertOrderedList(items) {
        const listNode = this.state.schema.nodes.orderedList.create({}, items);
        this.insertNewNode(listNode);
        return this;
    }
    /**
     * Convert the document to JSON.
     */
    contentJson() {
        const inObj = this.state.doc.toJSON();
        const outDoc = new content_document_1.ContentDocument(this.context, inObj.content.map((i) => content_object_1.ContentObject.fromJsonObj(i)));
        // Make sure we always have at least one paragraph node
        if (!outDoc.hasChildren) {
            const writer = new content_writer_1.ContentWriter(outDoc);
            writer.ensureParagraph();
        }
        return outDoc.toJson();
    }
    /**
     * Replaces the empty paragraph with the new node.
     * @param newNodes The nodes to insert.
     */
    insertNewNode(newNodes) {
        const tr = this.state.tr;
        tr.replaceWith(this.state.selection.from - 1, this.state.selection.to + 1, newNodes);
        const resolvedCursorPos = tr.doc.resolve(this.state.selection.from);
        const selection = prosemirror_state_1.Selection.near(resolvedCursorPos);
        tr.setSelection(selection);
        content_editor_1.ContentEditor.ensureEndNode(tr, this.state.schema.nodes.paragraph);
        this.state = this.state.apply(tr);
    }
    findTargetNodePos(uploadId) {
        // Loops through nodes trying to find the mediaUpload node with a matching uploadId
        for (let i = 0; i < this.state.doc.nodeSize; i++) {
            const node = this.state.doc.nodeAt(i);
            if (node !== null &&
                node !== undefined &&
                node.type.name === "mediaUpload" &&
                node.attrs.uploadId === uploadId) {
                return i;
            }
        }
        return -1;
    }
}
exports.Content = Content;
