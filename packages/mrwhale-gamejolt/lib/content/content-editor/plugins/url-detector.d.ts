declare type RegexResult = {
    index: number;
    match: string;
};
export declare class UrlDetector {
    static detect(text: string, offset: number): RegexResult[];
}
export {};
