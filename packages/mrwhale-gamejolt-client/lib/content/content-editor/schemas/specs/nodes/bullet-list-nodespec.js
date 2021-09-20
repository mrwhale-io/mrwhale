"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulletList = void 0;
exports.bulletList = {
    group: "block",
    content: "listItem+",
    toDOM: () => ["ul", 0],
    parseDOM: [{ tag: "ul" }],
};
