"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gif = void 0;
exports.gif = {
    group: "block",
    marks: "",
    draggable: true,
    selectable: true,
    attrs: {
        id: {
            default: "",
        },
        width: {
            default: 0,
        },
        height: {
            default: 0,
        },
        service: {
            default: "",
        },
        media: {
            default: {},
        },
        url: {
            default: "",
        },
    },
    toDOM: (node) => [
        "div",
        {
            "gif-id": node.attrs.id,
            "gif-width": node.attrs.width,
            "gif-height": node.attrs.height,
            "gif-service": node.attrs.service,
            "gif-media": JSON.stringify(node.attrs.media),
            "gif-url": node.attrs.url,
        },
    ],
    parseDOM: [
        {
            tag: "div[gif-id]",
            getAttrs: (domNode) => {
                return {
                    id: domNode.getAttribute("gif-id"),
                    width: parseInt(domNode.getAttribute("gif-width"), 10),
                    height: parseInt(domNode.getAttribute("gif-height"), 10),
                    service: domNode.getAttribute("gif-service"),
                    media: JSON.parse(domNode.getAttribute("gif-media") || "{}"),
                    url: domNode.getAttribute("gif-url"),
                };
            },
        },
    ],
};
