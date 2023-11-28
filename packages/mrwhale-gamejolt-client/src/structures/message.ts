import { User } from "./user";
import { Client } from "../client/client";
import { ContentDocument } from "../content/content-document";
import { Content } from "../content/content";

export type MessageType = "content" | "sticker" | "invite";

export class Message {
  id!: number;
  user_id!: number;
  user!: User;
  room_id!: number;
  content!: string;
  logged_on!: Date;
  type: MessageType;

  private replied = false;

  get textContent(): string {
    const doc = ContentDocument.fromJson(this.content);
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

  get mentions(): User[] {
    const doc = ContentDocument.fromJson(this.content);
    const mentions: User[] = [];

    for (const hydrationEntry of doc.hydration) {
      if (hydrationEntry.type === "username") {
        mentions.push(new User(hydrationEntry.data));
      }
    }

    return mentions;
  }

  get isMentioned(): boolean {
    return this.mentions.some((mention) => mention.id === this.client.userId);
  }

  get isRoomOwner(): boolean {
    return (
      this.client.chat.activeRooms[this.room_id] &&
      this.user.id === this.client.chat.activeRooms[this.room_id].owner_id
    );
  }

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
   *
   * @param message The content of the message.
   */
  reply(message: string | Content): Promise<Message> {
    if (this.user.id === this.client.chat.currentUser.id) {
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
   * Edit the message content.
   *
   * @param message The content of the message
   */
  edit(message: string | Content): void {
    if (this.user.id !== this.client.chat.currentUser.id) {
      return;
    }

    this.client.chat.editMessage(message, this);
  }

  toString(): string {
    return this.textContent;
  }
}
