"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = exports.LINK_LENGTH = void 0;
exports.LINK_LENGTH = 23;
exports.link = {
    attrs: {
        href: {},
        title: { default: null },
        autolink: { default: false },
    },
    inclusive: false,
    toDOM(mark) {
        const { href, title, autolink } = mark.attrs;
        return [
            "span",
            {
                class: "content-editor-link",
                title: href,
                "data-href": href,
                "data-title": title,
                "data-autolink": autolink,
            },
            0,
        ];
    },
    parseDOM: [
        {
            tag: "span[data-href]",
            getAttrs(domNode) {
                return {
                    href: domNode.getAttribute("data-href"),
                    title: domNode.getAttribute("data-title"),
                    autolink: domNode.getAttribute("data-autolink"),
                };
            },
        },
    ],
};
