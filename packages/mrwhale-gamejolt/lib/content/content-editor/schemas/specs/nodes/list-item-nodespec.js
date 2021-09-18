"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listItem = void 0;
exports.listItem = {
    content: "block*",
    toDOM: () => ["li", 0],
    parseDOM: [{ tag: "li" }],
    defining: true,
};
