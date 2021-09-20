"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hr = void 0;
exports.hr = {
    group: "block",
    selectable: false,
    parseDOM: [{ tag: "hr" }],
    marks: "",
    toDOM() {
        return ["hr"];
    },
};
