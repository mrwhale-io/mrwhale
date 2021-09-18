import { Schema } from "prosemirror-model";
import { ContextCapabilities } from "../../content-context";
export declare class ContentEditorSchema extends Schema<"text" | "paragraph" | "hardBreak" | "gjEmoji" | "mediaItem" | "mediaUpload" | "embed" | "codeBlock" | "blockquote" | "listItem" | "bulletList" | "orderedList" | "hr" | "spoiler" | "heading" | "gif", "strong" | "em" | "code" | "link" | "strike" | "mention" | "tag"> {
}
/**
 * Generates the content editor schema.
 * @param capabilities The capabilities of each valid context.
 */
export declare function generateSchema(capabilities: ContextCapabilities): ContentEditorSchema;
