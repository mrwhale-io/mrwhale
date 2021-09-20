import { ContentObject, ContentObjectType } from "./content-object";
import { MarkObject, MarkObjectType } from "./mark-object";
export declare abstract class ContentNode {
    protected _content: ContentObject[];
    get content(): ReadonlyArray<ContentObject>;
    get hasChildren(): boolean;
    get lastChild(): unknown;
    get firstChild(): any;
    constructor(content?: ContentObject[]);
    getChildrenByType(type: ContentObjectType): ContentObject[];
    getMarks(type: MarkObjectType): MarkObject[];
    appendChild(child: ContentObject): void;
    /**
     * Returns a uniform length computed by the children and their content.
     * Each node type can define its own way to compute its length.
     */
    getLength(): number;
}
