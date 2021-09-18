"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mention = void 0;
exports.mention = {
    attrs: {
        username: {},
    },
    inclusive: false,
    toDOM(mark) {
        const { username } = mark.attrs;
        return [
            "span",
            {
                class: "content-editor-mention",
                "data-username": username,
            },
            0,
        ];
    },
    parseDOM: [
        {
            tag: "span[data-username]",
            getAttrs(domNode) {
                return {
                    username: domNode.getAttribute("data-username"),
                };
            },
        },
    ],
};
