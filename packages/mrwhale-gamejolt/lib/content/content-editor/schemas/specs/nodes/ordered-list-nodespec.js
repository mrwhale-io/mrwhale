"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderedList = void 0;
exports.orderedList = {
    group: "block",
    content: "listItem+",
    toDOM: () => ["ol", 0],
    parseDOM: [{ tag: "ol" }],
};
