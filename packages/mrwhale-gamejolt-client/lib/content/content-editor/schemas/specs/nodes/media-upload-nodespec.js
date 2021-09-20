"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaUpload = void 0;
// When an image gets pasted into the editor, this node handles the upload to a Media Item
// It will be replaced with a mediaItem node after the upload is complete
exports.mediaUpload = {
    group: "block",
    attrs: {
        uploadId: {},
    },
    toDOM: (node) => ["div", { uploadId: node.attrs.uploadId }],
};
