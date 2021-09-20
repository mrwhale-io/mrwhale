"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchema = exports.ContentEditorSchema = void 0;
const prosemirror_model_1 = require("prosemirror-model");
const prosemirror_schema_basic_1 = require("prosemirror-schema-basic");
const link_markspec_1 = require("./specs/marks/link-markspec");
const mention_markspec_1 = require("./specs/marks/mention-markspec");
const strike_markspec_1 = require("./specs/marks/strike-markspec");
const tag_markspec_1 = require("./specs/marks/tag-markspec");
const blockquote_nodespec_1 = require("./specs/nodes/blockquote-nodespec");
const bullet_list_nodespec_1 = require("./specs/nodes/bullet-list-nodespec");
const code_block_nodespec_1 = require("./specs/nodes/code-block-nodespec");
const embed_nodespec_1 = require("./specs/nodes/embed-nodespec");
const gif_nodespec_1 = require("./specs/nodes/gif-nodespec");
const gj_emoji_nodespec_1 = require("./specs/nodes/gj-emoji-nodespec");
const hard_break_nodespec_1 = require("./specs/nodes/hard-break-nodespec");
const heading_nodespec_1 = require("./specs/nodes/heading-nodespec");
const hr_nodespec_1 = require("./specs/nodes/hr-nodespec");
const list_item_nodespec_1 = require("./specs/nodes/list-item-nodespec");
const media_item_nodespec_1 = require("./specs/nodes/media-item-nodespec");
const media_upload_nodespec_1 = require("./specs/nodes/media-upload-nodespec");
const ordered_list_nodespec_1 = require("./specs/nodes/ordered-list-nodespec");
const paragraph_nodespec_1 = require("./specs/nodes/paragraph-nodespec");
const spoiler_nodespec_1 = require("./specs/nodes/spoiler-nodespec");
class ContentEditorSchema extends prosemirror_model_1.Schema {
}
exports.ContentEditorSchema = ContentEditorSchema;
/**
 * Generates the content editor schema.
 * @param capabilities The capabilities of each valid context.
 */
function generateSchema(capabilities) {
    return new ContentEditorSchema({
        nodes: generateNodes(capabilities),
        marks: generateMarks(capabilities),
    });
}
exports.generateSchema = generateSchema;
function generateNodes(capabilities) {
    const nodes = {
        text: {
            group: "inline",
        },
        paragraph: paragraph_nodespec_1.paragraph,
        hardBreak: hard_break_nodespec_1.hardBreak,
        doc: {
            content: "block*",
        },
    };
    const allowedDocNodes = ["paragraph"];
    if (capabilities.emoji) {
        nodes.gjEmoji = gj_emoji_nodespec_1.gjEmoji;
    }
    if (capabilities.media) {
        nodes.mediaItem = media_item_nodespec_1.mediaItem;
        nodes.mediaUpload = media_upload_nodespec_1.mediaUpload;
    }
    if (capabilities.hasAnyEmbed) {
        nodes.embed = embed_nodespec_1.embed;
    }
    if (capabilities.codeBlock) {
        nodes.codeBlock = code_block_nodespec_1.codeBlock;
    }
    if (capabilities.blockquote) {
        nodes.blockquote = blockquote_nodespec_1.blockquote;
    }
    if (capabilities.list) {
        nodes.listItem = list_item_nodespec_1.listItem;
        nodes.bulletList = bullet_list_nodespec_1.bulletList;
        nodes.orderedList = ordered_list_nodespec_1.orderedList;
        allowedDocNodes.push("bulletList", "orderedList");
    }
    if (capabilities.hr) {
        nodes.hr = hr_nodespec_1.hr;
    }
    if (capabilities.spoiler) {
        nodes.spoiler = spoiler_nodespec_1.spoiler;
        allowedDocNodes.push("spoiler");
    }
    if (capabilities.heading) {
        nodes.heading = heading_nodespec_1.heading;
        allowedDocNodes.push("heading");
    }
    if (capabilities.gif) {
        nodes.gif = gif_nodespec_1.gif;
    }
    if (allowedDocNodes.length > 0) {
        nodes.doc.content += " (" + allowedDocNodes.join(" | ") + ")";
    }
    return nodes;
}
function generateMarks(capabilities) {
    const marks = {};
    if (capabilities.textBold) {
        marks.strong = prosemirror_schema_basic_1.schema.marks.strong.spec;
    }
    if (capabilities.textItalic) {
        marks.em = prosemirror_schema_basic_1.schema.marks.em.spec;
    }
    if (capabilities.textCode) {
        marks.code = prosemirror_schema_basic_1.schema.marks.code.spec;
    }
    if (capabilities.textLink) {
        marks.link = link_markspec_1.link;
    }
    if (capabilities.textStrike) {
        marks.strike = strike_markspec_1.strike;
    }
    if (capabilities.mention) {
        marks.mention = mention_markspec_1.mention;
    }
    if (capabilities.tag) {
        marks.tag = tag_markspec_1.tag;
    }
    return marks;
}
