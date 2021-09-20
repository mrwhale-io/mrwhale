"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strike = void 0;
exports.strike = {
    parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }],
    toDOM() {
        return ["s", 0];
    },
};
