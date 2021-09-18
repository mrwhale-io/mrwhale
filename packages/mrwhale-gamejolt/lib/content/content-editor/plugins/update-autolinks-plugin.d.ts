import { MarkType, Node } from "prosemirror-model";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { ContextCapabilities } from "../../content-context";
import { ContentEditorSchema } from "../schemas/content-editor-schema";
declare type TextCell = {
    index: number;
    text: string;
};
export default class UpdateAutolinkPlugin extends Plugin {
    private schema;
    private capabilities;
    constructor(schema: ContentEditorSchema, capabilities: ContextCapabilities);
    appendTransaction(_transactions: Transaction<ContentEditorSchema>[], oldState: EditorState<ContentEditorSchema>, newState: EditorState<ContentEditorSchema>): Transaction<ContentEditorSchema>;
    /**
     * Checks whether the given range (from - to) has one of the three mark types attached to it:
     *  - mention
     *  - tag
     *  - link
     */
    rangeHasLinks(tr: Transaction<ContentEditorSchema>, from: number, to: number): boolean;
    processTags(tr: Transaction<ContentEditorSchema>, cell: TextCell, markType: MarkType<ContentEditorSchema>, paragraphPos: number): void;
    processMentions(tr: Transaction<ContentEditorSchema>, cell: TextCell, markType: MarkType<ContentEditorSchema>, paragraphPos: number): void;
    processLinks(tr: Transaction<ContentEditorSchema>, cell: TextCell, markType: MarkType<ContentEditorSchema>, paragraphPos: number): void;
    removeAutolinkMarks(tr: Transaction<ContentEditorSchema>, paragraphPos: number, paragraph: Node<ContentEditorSchema>): void;
    getParagraphs(parent: Node<ContentEditorSchema>): Node<ContentEditorSchema>[];
    getTextCells(parent: Node<ContentEditorSchema>): TextCell[];
}
export {};
