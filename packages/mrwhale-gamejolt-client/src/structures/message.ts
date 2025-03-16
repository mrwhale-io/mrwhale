import { User } from "./user";
import { Client } from "../client/client";
import { ContentDocument } from "../content/content-document";
import { Content } from "../content/content";

export type MessageType = "content" | "sticker" | "invite";

/**
 * Represents a message in the chat.
 */
export class Message {
  /**
   * The unique identifier of the message.
   */
  id!: number;

  /**
   * The unique identifier of the user who sent the message.
   */
  user_id!: number;

  /**
   * The user who sent the message.
   */
  user!: User;

  /**
   * The unique identifier of the room where the message was sent.
   */
  room_id!: number;

  /**
   * The content of the message.
   */
  content!: string;

  /**
   * The date and time when the message was logged.
   */
  logged_on!: Date;

  /**
   * The type of the message.
   */
  type: MessageType;

  /**
   * Indicates if the message has been replied to already.
   */
  private replied = false;

  /**
   * Gets the text content of the message.
   */
  get textContent(): string {
    const doc = ContentDocument.fromJson(this.content);
    return this.extractTextContent(doc);
  }

  /**
   * Gets the users mentioned in the message.
   */
  get mentions(): User[] {
    const doc = ContentDocument.fromJson(this.content);
    return this.extractMentions(doc);
  }

  /**
   * Checks if the current user is mentioned in the message.
   */
  get isMentioned(): boolean {
    return this.mentions.some((mention) => mention.id === this.client.userId);
  }

  /**
   * Checks if the message sender is the owner of the room.
   */
  get isRoomOwner(): boolean {
    return (
      this.client.chat.activeRooms[this.room_id] &&
      this.user.id === this.client.chat.activeRooms[this.room_id].owner_id
    );
  }

  /**
   * Gets the first mentioned user or the author of the message.
   */
  get firstMentionOrAuthor(): User {
    let user = this.mentions[0];
    if (!user) {
      user = this.user;
    }

    return user;
  }

  constructor(public client: Client, data: Partial<Message> = {}) {
    Object.assign(this, data);

    this.client = client;

    if (
      typeof this.logged_on === "number" ||
      typeof this.logged_on === "string"
    ) {
      this.logged_on = new Date(this.logged_on);
    }

    if (data.user) {
      this.user = new User(data.user);
    }
  }

  /**
   * Reply directly to this message.
   * @param message The content of the message.
   */
  reply(message: string | Content): Promise<Message> {
    // Prevent replying to self.
    if (this.user.id === this.client.chat.currentUser.id || this.replied) {
      return;
    }

    return new Promise<Message>((resolve, reject) => {
      this.client.grid.chat
        .sendMessage(message, this.room_id)
        .receive("error", reject)
        .receive("ok", (data) => resolve(new Message(this.client, data)));
    });
  }

  /**
   * Edit the content of this message.
   * @param message The edited content of the message.
   */
  edit(message: string | Content): void {
    if (this.user.id !== this.client.chat.currentUser.id) {
      return;
    }

    this.client.chat.editMessage(message, this);
  }

  /**
   * Converts the message to a string representation.
   * @returns The text content of the message.
   */
  toString(): string {
    return this.textContent;
  }

  /**
   * Extracts text content from a ContentDocument.
   * @param doc The ContentDocument to extract text from.
   * @returns The extracted text content.
   */
  private extractTextContent(doc: ContentDocument): string {
    let result = "";
    for (const outerContent of doc.content) {
      for (const innerContent of outerContent.content) {
        if (innerContent.text) {
          result += innerContent.text;
        }
      }
    }
    return result;
  }

  /**
   * Extracts mentioned users from a ContentDocument.
   * @param doc The ContentDocument to extract mentions from.
   * @returns An array of mentioned users.
   */
  private extractMentions(doc: ContentDocument): User[] {
    const mentions: User[] = [];
    for (const hydrationEntry of doc.hydration) {
      if (hydrationEntry.type === "username") {
        mentions.push(new User(hydrationEntry.data));
      }
    }
    return mentions;
  }
}
