"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeBlock = void 0;
exports.codeBlock = {
    group: "block",
    marks: "",
    code: true,
    content: "(text | hardBreak)*",
    toDOM: () => ["pre", 0],
    parseDOM: [{ tag: "pre" }],
};
