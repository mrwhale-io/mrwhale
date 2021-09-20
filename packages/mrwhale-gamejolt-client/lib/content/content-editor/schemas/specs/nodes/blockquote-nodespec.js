"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockquote = void 0;
exports.blockquote = {
    group: "block",
    content: "block*",
    defining: true,
    toDOM: () => ["blockquote", 0],
    parseDOM: [{ tag: "blockquote" }],
};
