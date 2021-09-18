"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paragraph = void 0;
exports.paragraph = {
    group: "block",
    content: "inline*",
    toDOM: () => ["p", 0],
    parseDOM: [{ tag: "p" }],
};
