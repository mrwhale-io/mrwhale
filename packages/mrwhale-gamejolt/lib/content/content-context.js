"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextCapabilities = void 0;
var ContextCapabilityType;
(function (ContextCapabilityType) {
    ContextCapabilityType[ContextCapabilityType["TextBold"] = 0] = "TextBold";
    ContextCapabilityType[ContextCapabilityType["TextItalic"] = 1] = "TextItalic";
    ContextCapabilityType[ContextCapabilityType["TextLink"] = 2] = "TextLink";
    ContextCapabilityType[ContextCapabilityType["TextCode"] = 3] = "TextCode";
    ContextCapabilityType[ContextCapabilityType["TextStrike"] = 4] = "TextStrike";
    ContextCapabilityType[ContextCapabilityType["CustomLink"] = 5] = "CustomLink";
    ContextCapabilityType[ContextCapabilityType["Emoji"] = 6] = "Emoji";
    ContextCapabilityType[ContextCapabilityType["Tag"] = 7] = "Tag";
    ContextCapabilityType[ContextCapabilityType["Mention"] = 8] = "Mention";
    ContextCapabilityType[ContextCapabilityType["Media"] = 9] = "Media";
    ContextCapabilityType[ContextCapabilityType["Gif"] = 10] = "Gif";
    ContextCapabilityType[ContextCapabilityType["EmbedVideo"] = 11] = "EmbedVideo";
    ContextCapabilityType[ContextCapabilityType["EmbedMusic"] = 12] = "EmbedMusic";
    ContextCapabilityType[ContextCapabilityType["EmbedModel"] = 13] = "EmbedModel";
    ContextCapabilityType[ContextCapabilityType["CodeBlock"] = 14] = "CodeBlock";
    ContextCapabilityType[ContextCapabilityType["Blockquote"] = 15] = "Blockquote";
    ContextCapabilityType[ContextCapabilityType["List"] = 16] = "List";
    ContextCapabilityType[ContextCapabilityType["HorizontalRule"] = 17] = "HorizontalRule";
    ContextCapabilityType[ContextCapabilityType["Spoiler"] = 18] = "Spoiler";
    ContextCapabilityType[ContextCapabilityType["Heading"] = 19] = "Heading";
})(ContextCapabilityType || (ContextCapabilityType = {}));
class ContextCapabilities {
    constructor(capabilities) {
        this.capabilities = capabilities;
    }
    get hasAnyBlock() {
        return (this.hasAnyEmbed ||
            this.media ||
            this.codeBlock ||
            this.blockquote ||
            this.list ||
            this.hr ||
            this.spoiler);
    }
    get hasAnyText() {
        return (this.textBold ||
            this.textItalic ||
            (this.textLink && this.customLink) ||
            this.textCode ||
            this.textStrike);
    }
    get hasAnyEmbed() {
        return this.embedMusic || this.embedVideo || this.embedModel;
    }
    get textBold() {
        return this.hasCapability(ContextCapabilityType.TextBold);
    }
    get textItalic() {
        return this.hasCapability(ContextCapabilityType.TextItalic);
    }
    get textLink() {
        return this.hasCapability(ContextCapabilityType.TextLink);
    }
    get textCode() {
        return this.hasCapability(ContextCapabilityType.TextCode);
    }
    get textStrike() {
        return this.hasCapability(ContextCapabilityType.TextStrike);
    }
    get customLink() {
        return this.hasCapability(ContextCapabilityType.CustomLink);
    }
    get media() {
        // for media items, also allows uploading through the media upload component
        return this.hasCapability(ContextCapabilityType.Media);
    }
    get embedVideo() {
        return this.hasCapability(ContextCapabilityType.EmbedVideo);
    }
    get embedMusic() {
        return this.hasCapability(ContextCapabilityType.EmbedMusic);
    }
    get embedModel() {
        return this.hasCapability(ContextCapabilityType.EmbedModel);
    }
    get codeBlock() {
        return this.hasCapability(ContextCapabilityType.CodeBlock);
    }
    get blockquote() {
        return this.hasCapability(ContextCapabilityType.Blockquote);
    }
    get emoji() {
        return this.hasCapability(ContextCapabilityType.Emoji);
    }
    get list() {
        return this.hasCapability(ContextCapabilityType.List);
    }
    get hr() {
        return this.hasCapability(ContextCapabilityType.HorizontalRule);
    }
    get spoiler() {
        return this.hasCapability(ContextCapabilityType.Spoiler);
    }
    get tag() {
        return this.hasCapability(ContextCapabilityType.Tag);
    }
    get heading() {
        return this.hasCapability(ContextCapabilityType.Heading);
    }
    get mention() {
        return this.hasCapability(ContextCapabilityType.Mention);
    }
    get gif() {
        return this.hasCapability(ContextCapabilityType.Gif);
    }
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }
    static getEmpty() {
        return new ContextCapabilities([]);
    }
    static getForContext(context) {
        switch (context) {
            case "fireside-post-lead":
                return new ContextCapabilities([
                    ContextCapabilityType.TextLink,
                    ContextCapabilityType.Tag,
                    ContextCapabilityType.Mention,
                ]);
            case "fireside-post-article":
            case "forum-post":
                return new ContextCapabilities([
                    ContextCapabilityType.TextBold,
                    ContextCapabilityType.TextItalic,
                    ContextCapabilityType.TextLink,
                    ContextCapabilityType.TextCode,
                    ContextCapabilityType.TextStrike,
                    ContextCapabilityType.CustomLink,
                    ContextCapabilityType.Media,
                    ContextCapabilityType.EmbedVideo,
                    ContextCapabilityType.EmbedMusic,
                    ContextCapabilityType.EmbedModel,
                    ContextCapabilityType.CodeBlock,
                    ContextCapabilityType.Blockquote,
                    ContextCapabilityType.Emoji,
                    ContextCapabilityType.List,
                    ContextCapabilityType.HorizontalRule,
                    ContextCapabilityType.Spoiler,
                    ContextCapabilityType.Tag,
                    ContextCapabilityType.Heading,
                    ContextCapabilityType.Mention,
                    ContextCapabilityType.Gif,
                ]);
            case "game-description":
            case "community-description":
                return new ContextCapabilities([
                    ContextCapabilityType.TextBold,
                    ContextCapabilityType.TextItalic,
                    ContextCapabilityType.TextLink,
                    ContextCapabilityType.TextCode,
                    ContextCapabilityType.TextStrike,
                    ContextCapabilityType.CustomLink,
                    ContextCapabilityType.Media,
                    ContextCapabilityType.CodeBlock,
                    ContextCapabilityType.Blockquote,
                    ContextCapabilityType.Emoji,
                    ContextCapabilityType.List,
                    ContextCapabilityType.HorizontalRule,
                    ContextCapabilityType.Spoiler,
                    ContextCapabilityType.Tag,
                    ContextCapabilityType.Heading,
                    ContextCapabilityType.Mention,
                ]);
            case "game-comment":
            case "user-comment":
            case "fireside-post-comment":
                return new ContextCapabilities([
                    ContextCapabilityType.TextBold,
                    ContextCapabilityType.TextItalic,
                    ContextCapabilityType.TextLink,
                    ContextCapabilityType.TextCode,
                    ContextCapabilityType.TextStrike,
                    ContextCapabilityType.CustomLink,
                    ContextCapabilityType.Media,
                    ContextCapabilityType.CodeBlock,
                    ContextCapabilityType.Blockquote,
                    ContextCapabilityType.Emoji,
                    ContextCapabilityType.List,
                    ContextCapabilityType.HorizontalRule,
                    ContextCapabilityType.Spoiler,
                    ContextCapabilityType.Tag,
                    ContextCapabilityType.Mention,
                    ContextCapabilityType.Gif,
                ]);
            case "user-bio":
                return new ContextCapabilities([
                    ContextCapabilityType.TextBold,
                    ContextCapabilityType.TextItalic,
                    ContextCapabilityType.TextLink,
                    ContextCapabilityType.TextCode,
                    ContextCapabilityType.TextStrike,
                    ContextCapabilityType.CustomLink,
                    ContextCapabilityType.CodeBlock,
                    ContextCapabilityType.Blockquote,
                    ContextCapabilityType.Emoji,
                    ContextCapabilityType.List,
                    ContextCapabilityType.HorizontalRule,
                    ContextCapabilityType.Spoiler,
                    ContextCapabilityType.Tag,
                    ContextCapabilityType.Mention,
                ]);
            case "chat-message":
                return new ContextCapabilities([
                    ContextCapabilityType.TextBold,
                    ContextCapabilityType.TextItalic,
                    ContextCapabilityType.TextLink,
                    ContextCapabilityType.TextCode,
                    ContextCapabilityType.TextStrike,
                    ContextCapabilityType.Media,
                    ContextCapabilityType.CodeBlock,
                    ContextCapabilityType.Blockquote,
                    ContextCapabilityType.Emoji,
                    ContextCapabilityType.List,
                    ContextCapabilityType.Spoiler,
                    ContextCapabilityType.Tag,
                    ContextCapabilityType.Mention,
                    ContextCapabilityType.Gif,
                ]);
        }
    }
}
exports.ContextCapabilities = ContextCapabilities;
