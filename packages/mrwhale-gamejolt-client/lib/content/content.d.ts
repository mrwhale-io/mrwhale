import { ContentEditorSchema } from "./content-editor/schemas/content-editor-schema";
import { EditorState } from "prosemirror-state";
import { Node, Mark } from "prosemirror-model";
import { ContextCapabilities, ContentContext } from "./content-context";
import { MediaItem } from "../structures/media-item";
/**
 * Builds content editor content.
 */
export declare class Content {
    context: ContentContext;
    state: EditorState<ContentEditorSchema>;
    schema: ContentEditorSchema;
    capabilities: ContextCapabilities;
    constructor(context?: ContentContext, content?: string);
    /**
     * Create a text node in the schema. Empty text nodes are not allowed.
     * @param content The text content.
     * @param [marks] Any marks to add.
     */
    textNode(content: string, marks?: Mark<ContentEditorSchema>[]): Node<ContentEditorSchema>;
    /**
     * Create an auto link mark.
     * @param href The address of the link.
     * @param title The title of the link.
     */
    autoLink(href: string, title: string): Mark<ContentEditorSchema>;
    /**
     * Create a user mention mark.
     * @param username The username of the user to mention.
     */
    mention(username: string): Mark<ContentEditorSchema>;
    /**
     * Create a code mark.
     * @param text The text content of the code.
     */
    code(text: string): Mark<ContentEditorSchema>;
    /**
     * Insert a paragraph node.
     * @param [content] The nodes to contain within paragraph node.
     */
    paragraphNode(content?: Node<ContentEditorSchema> | Node<ContentEditorSchema>[]): Node<ContentEditorSchema>;
    /**
     * Insert a list item node.
     * @param [content] The nodes to contain within list item node.
     */
    listItemNode(content?: Node<ContentEditorSchema> | Node<ContentEditorSchema>[]): Node<ContentEditorSchema>;
    /**
     * Insert a text node.
     * @param content The content of the text node.
     * @param [marks] Any marks to include.
     */
    insertText(content: string, marks?: Mark<ContentEditorSchema>[]): this;
    /**
     * Insert a media upload node.
     * @param mediaItem The media item to insert.
     */
    insertImage(mediaItem: MediaItem): this;
    /**
     * Insert a code block node.
     * @param [content] The nodes to contain within code block node.
     */
    insertCodeBlock(content: string | Node<ContentEditorSchema> | Node<ContentEditorSchema>[]): this;
    /**
     * Insert a bullet list node.
     * @param items The nodes to contain within bullet list node.
     */
    insertBulletList(items: Node<ContentEditorSchema>[]): this;
    /**
     * Insert a ordered list node.
     * @param items The nodes to contain within ordered list node.
     */
    insertOrderedList(items: Node<ContentEditorSchema>[]): this;
    /**
     * Convert the document to JSON.
     */
    contentJson(): string;
    /**
     * Replaces the empty paragraph with the new node.
     * @param newNodes The nodes to insert.
     */
    insertNewNode(newNodes: Node | Node[]): void;
    private findTargetNodePos;
}
