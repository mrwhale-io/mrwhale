import { ContentContext } from "./content-context";
import { ContentNode } from "./content-node";
import { ContentObject } from "./content-object";
/**
 * The type of source passed into the hydrator, not what the resulting hydration data will be.
 */
export declare type ContentHydrationType = 'media-item-id' | 'username' | 'soundcloud-track-url' | 'soundcloud-track-id';
export declare type ContentHydrationDataEntry = {
    type: ContentHydrationType;
    source: string;
    data: unknown;
};
export declare class ContentDocument extends ContentNode {
    version: string;
    createdOn: number;
    context: ContentContext;
    hydration: ContentHydrationDataEntry[];
    constructor(context: ContentContext, content?: ContentObject[]);
    static fromJson(json: string): ContentDocument;
    toJson(): string;
    /**
     * Determines whether there is any "content" in this document.
     * This disregards empty objects like paragraphs with only empty text nodes or list items with empty paragraphs.
     */
    get hasContent(): boolean;
    getLength(): number;
    /**
     * Ensures that the last content object is a paragraph.
     *
     * This is needed only because the content editor appends a paragraph node at the end of the document.
     * That is done to allow the user to click into it to use the + menu/easily add an empty paragraph.
     */
    ensureEndParagraph(): void;
}
