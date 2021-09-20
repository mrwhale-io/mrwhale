"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embed = void 0;
exports.embed = {
    group: "block",
    marks: "",
    draggable: false,
    selectable: true,
    attrs: {
        type: {
            default: "",
        },
        source: {
            default: "",
        },
    },
    toDOM: (node) => [
        "div",
        {
            "embed-type": node.attrs.type,
            "embed-source": node.attrs.source,
        },
    ],
    parseDOM: [
        {
            tag: "div[embed-type]",
            getAttrs: (domNode) => {
                return {
                    type: domNode.getAttribute("embed-type"),
                    source: domNode.getAttribute("embed-source"),
                };
            },
        },
    ],
};
