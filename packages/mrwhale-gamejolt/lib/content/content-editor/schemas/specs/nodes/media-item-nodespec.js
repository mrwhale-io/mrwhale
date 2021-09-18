"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaItem = void 0;
exports.mediaItem = {
    group: "block",
    marks: "",
    draggable: true,
    selectable: true,
    attrs: {
        id: {
            default: 0,
        },
        width: {
            default: 0,
        },
        height: {
            default: 0,
        },
        caption: {
            default: "",
        },
        align: {
            default: "center",
        },
        href: {
            default: "",
        },
    },
    toDOM: (node) => [
        "div",
        {
            "media-item-id": node.attrs.id,
            "media-item-width": node.attrs.width,
            "media-item-height": node.attrs.height,
            "media-item-caption": node.attrs.caption,
            "media-item-align": node.attrs.align,
            "media-item-href": node.attrs.href,
        },
    ],
    parseDOM: [
        {
            tag: "div[media-item-id]",
            getAttrs: (domNode) => {
                return {
                    id: parseInt(domNode.getAttribute("media-item-id"), 10),
                    width: parseInt(domNode.getAttribute("media-item-width"), 10),
                    height: parseInt(domNode.getAttribute("media-item-height"), 10),
                    caption: domNode.getAttribute("media-item-caption"),
                    align: domNode.getAttribute("media-item-align"),
                    href: domNode.getAttribute("media-item-href"),
                };
            },
        },
    ],
};
