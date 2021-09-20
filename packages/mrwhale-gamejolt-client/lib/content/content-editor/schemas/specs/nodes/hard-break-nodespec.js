"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardBreak = void 0;
exports.hardBreak = {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    marks: "",
    toDOM() {
        return ["br"];
    },
};
