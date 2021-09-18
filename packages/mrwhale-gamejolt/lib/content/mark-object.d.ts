export declare type MarkObjectType = "strong" | "em" | "code" | "link" | "strike" | "mention" | "tag";
export declare class MarkObject {
    type: MarkObjectType;
    attrs: {
        [key: string]: any;
    };
    constructor(type: MarkObjectType);
    static fromJsonObj(jsonObj: Partial<{
        type: MarkObjectType;
        attrs: any;
    }>): MarkObject;
    toJsonObj(): Record<string, unknown>;
}
