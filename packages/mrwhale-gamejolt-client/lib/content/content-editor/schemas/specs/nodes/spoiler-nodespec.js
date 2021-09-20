"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spoiler = void 0;
exports.spoiler = {
    group: "block",
    content: "block*",
    defining: true,
    toDOM: () => [
        "blockquote",
        {
            spoiler: "true",
            class: "content-editor-spoiler",
        },
        0,
    ],
    parseDOM: [{ tag: "blockquote[spoiler]" }],
};
