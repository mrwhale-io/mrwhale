import { ContentNode } from "./content-node";
import { MarkObject } from "./mark-object";
export declare type ContentObjectType = "text" | "paragraph" | "table" | "tableRow" | "tableCell" | "hr" | "codeBlock" | "gjEmoji" | "blockquote" | "hardBreak" | "embed" | "mediaItem" | "orderedList" | "bulletList" | "listItem" | "spoiler" | "heading" | "gif";
export declare class ContentObject extends ContentNode {
    type: ContentObjectType;
    text: string | null;
    attrs: {
        [key: string]: any;
    };
    marks: MarkObject[];
    constructor(type: ContentObjectType);
    get hasContent(): boolean;
    static fromJsonObj(jsonObj: Partial<ContentObject>): ContentObject;
    toJsonObj(): Record<string, unknown>;
    getLength(): number;
}
