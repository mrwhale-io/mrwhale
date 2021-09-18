export declare type ContentContext = "fireside-post-lead" | "fireside-post-article" | "fireside-post-comment" | "game-description" | "game-comment" | "user-comment" | "user-bio" | "forum-post" | "community-description" | "chat-message";
declare enum ContextCapabilityType {
    TextBold = 0,
    TextItalic = 1,
    TextLink = 2,
    TextCode = 3,
    TextStrike = 4,
    CustomLink = 5,
    Emoji = 6,
    Tag = 7,
    Mention = 8,
    Media = 9,
    Gif = 10,
    EmbedVideo = 11,
    EmbedMusic = 12,
    EmbedModel = 13,
    CodeBlock = 14,
    Blockquote = 15,
    List = 16,
    HorizontalRule = 17,
    Spoiler = 18,
    Heading = 19
}
export declare class ContextCapabilities {
    capabilities: ContextCapabilityType[];
    get hasAnyBlock(): boolean;
    get hasAnyText(): boolean;
    get hasAnyEmbed(): boolean;
    get textBold(): boolean;
    get textItalic(): boolean;
    get textLink(): boolean;
    get textCode(): boolean;
    get textStrike(): boolean;
    get customLink(): boolean;
    get media(): boolean;
    get embedVideo(): boolean;
    get embedMusic(): boolean;
    get embedModel(): boolean;
    get codeBlock(): boolean;
    get blockquote(): boolean;
    get emoji(): boolean;
    get list(): boolean;
    get hr(): boolean;
    get spoiler(): boolean;
    get tag(): boolean;
    get heading(): boolean;
    get mention(): boolean;
    get gif(): boolean;
    private constructor();
    private hasCapability;
    static getEmpty(): ContextCapabilities;
    static getForContext(context: ContentContext): ContextCapabilities;
}
export {};
