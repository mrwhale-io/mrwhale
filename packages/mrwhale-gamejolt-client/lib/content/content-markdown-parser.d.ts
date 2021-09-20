import { MarkdownParser } from "prosemirror-markdown";
import { ContentEditorSchema } from "./content-editor/schemas/content-editor-schema";
/**
 * Create a content editor markdown parser.
 * @param schema The content editor schema.
 */
export declare const contentMarkdownParser: (schema: ContentEditorSchema) => MarkdownParser<ContentEditorSchema>;
