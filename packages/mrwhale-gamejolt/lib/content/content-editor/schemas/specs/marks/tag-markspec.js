"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tag = void 0;
exports.tag = {
    attrs: {
        tag: {},
    },
    inclusive: false,
    toDOM(mark) {
        const tagText = mark.attrs.tag;
        return [
            "span",
            {
                class: "content-editor-tag",
                "data-tag": tagText,
            },
            0,
        ];
    },
    parseDOM: [
        {
            tag: "span[data-tag]",
            getAttrs(domNode) {
                return {
                    tag: domNode.getAttribute("data-tag"),
                };
            },
        },
    ],
};
