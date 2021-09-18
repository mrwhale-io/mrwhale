"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentEditor = void 0;
class ContentEditor {
    /**
     * Ensures that the last node in the editor doc is a specific node.
     * @param tr The content editor transaction.
     * @param nodeType The node type.
     */
    static ensureEndNode(tr, nodeType) {
        if (tr.doc.lastChild && tr.doc.lastChild.type.name !== nodeType.name) {
            const newNode = nodeType.create();
            return tr.insert(tr.doc.nodeSize - 2, newNode);
        }
        return null;
    }
    static findNodePosition(state, node) {
        let found = -1;
        state.doc.descendants((child, pos) => {
            if (found > -1) {
                return false;
            }
            if (child === node) {
                found = pos;
                return false;
            }
        });
        if (found === -1) {
            throw new Error("Node not found in document");
        }
        return found;
    }
}
exports.ContentEditor = ContentEditor;
