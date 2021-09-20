"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heading = void 0;
exports.heading = {
    attrs: { level: { default: 1 } },
    group: "block",
    content: "paragraph+",
    defining: true,
    marks: "",
    toDOM: (node) => ["h" + (node.attrs.level + 2), {}, 0],
    parseDOM: [
        { tag: "h3", attrs: { level: 1 } },
        { tag: "h4", attrs: { level: 2 } },
    ],
};
