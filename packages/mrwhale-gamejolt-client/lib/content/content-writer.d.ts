import { ContentDocument } from "./content-document";
import { ContentObject } from "./content-object";
export declare class ContentWriter {
    private _doc;
    constructor(doc: ContentDocument);
    ensureParagraph(): ContentObject;
    appendTag(tag: string): void;
}
