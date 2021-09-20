export type ContentContext =
  | "fireside-post-lead"
  | "fireside-post-article"
  | "fireside-post-comment"
  | "game-description"
  | "game-comment"
  | "user-comment"
  | "user-bio"
  | "forum-post"
  | "community-description"
  | "chat-message";

enum ContextCapabilityType {
  TextBold,
  TextItalic,
  TextLink,
  TextCode,
  TextStrike,
  CustomLink,
  Emoji,
  Tag,
  Mention,
  Media,
  Gif,
  EmbedVideo,
  EmbedMusic,
  EmbedModel,
  CodeBlock,
  Blockquote,
  List,
  HorizontalRule,
  Spoiler,
  Heading,
}

export class ContextCapabilities {
  capabilities: ContextCapabilityType[];

  get hasAnyBlock(): boolean {
    return (
      this.hasAnyEmbed ||
      this.media ||
      this.codeBlock ||
      this.blockquote ||
      this.list ||
      this.hr ||
      this.spoiler
    );
  }

  get hasAnyText(): boolean {
    return (
      this.textBold ||
      this.textItalic ||
      (this.textLink && this.customLink) ||
      this.textCode ||
      this.textStrike
    );
  }

  get hasAnyEmbed(): boolean {
    return this.embedMusic || this.embedVideo || this.embedModel;
  }

  get textBold(): boolean {
    return this.hasCapability(ContextCapabilityType.TextBold);
  }

  get textItalic(): boolean {
    return this.hasCapability(ContextCapabilityType.TextItalic);
  }

  get textLink(): boolean {
    return this.hasCapability(ContextCapabilityType.TextLink);
  }

  get textCode(): boolean {
    return this.hasCapability(ContextCapabilityType.TextCode);
  }

  get textStrike(): boolean {
    return this.hasCapability(ContextCapabilityType.TextStrike);
  }

  get customLink(): boolean {
    return this.hasCapability(ContextCapabilityType.CustomLink);
  }

  get media(): boolean {
    // for media items, also allows uploading through the media upload component
    return this.hasCapability(ContextCapabilityType.Media);
  }

  get embedVideo(): boolean {
    return this.hasCapability(ContextCapabilityType.EmbedVideo);
  }

  get embedMusic(): boolean {
    return this.hasCapability(ContextCapabilityType.EmbedMusic);
  }

  get embedModel(): boolean {
    return this.hasCapability(ContextCapabilityType.EmbedModel);
  }

  get codeBlock(): boolean {
    return this.hasCapability(ContextCapabilityType.CodeBlock);
  }

  get blockquote(): boolean {
    return this.hasCapability(ContextCapabilityType.Blockquote);
  }

  get emoji(): boolean {
    return this.hasCapability(ContextCapabilityType.Emoji);
  }

  get list(): boolean {
    return this.hasCapability(ContextCapabilityType.List);
  }

  get hr(): boolean {
    return this.hasCapability(ContextCapabilityType.HorizontalRule);
  }

  get spoiler(): boolean {
    return this.hasCapability(ContextCapabilityType.Spoiler);
  }

  get tag(): boolean {
    return this.hasCapability(ContextCapabilityType.Tag);
  }

  get heading(): boolean {
    return this.hasCapability(ContextCapabilityType.Heading);
  }

  get mention(): boolean {
    return this.hasCapability(ContextCapabilityType.Mention);
  }

  get gif(): boolean {
    return this.hasCapability(ContextCapabilityType.Gif);
  }

  private constructor(capabilities: ContextCapabilityType[]) {
    this.capabilities = capabilities;
  }

  private hasCapability(capability: ContextCapabilityType) {
    return this.capabilities.includes(capability);
  }

  static getEmpty(): ContextCapabilities {
    return new ContextCapabilities([]);
  }

  static getForContext(context: ContentContext): ContextCapabilities {
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
