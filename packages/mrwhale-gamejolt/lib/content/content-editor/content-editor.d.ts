import { Node, NodeType } from "prosemirror-model";
import { Transaction, EditorState } from "prosemirror-state";
import { ContentEditorSchema } from "./schemas/content-editor-schema";
export declare class ContentEditor {
    /**
     * Ensures that the last node in the editor doc is a specific node.
     * @param tr The content editor transaction.
     * @param nodeType The node type.
     */
    static ensureEndNode(tr: Transaction<ContentEditorSchema>, nodeType: NodeType<ContentEditorSchema>): Transaction<ContentEditorSchema>;
    static findNodePosition(state: EditorState<ContentEditorSchema>, node: Node<ContentEditorSchema>): number;
}
