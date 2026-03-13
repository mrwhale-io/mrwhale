import { User } from "./user";
import { Client } from "../client/client";
import { ContentDocument } from "../content/content-document";
import { Content } from "../content/content";

export type MessageType = "content" | "sticker" | "invite";

/**
 * Represents a message in the chat.
 * This class provides methods to interact with messages, such as replying and editing.
 *
 * @example
 * ```typescript
 * client.chat.on('message', (message: Message) => {
 *   if (message.isMentioned) {
 *     await message.reply('Hello! You mentioned me.');
 *   }
 * });
 * ```
 */
export class Message {
  /**
   * The unique identifier of the message.
   */
  readonly id!: number;

  /**
   * The unique identifier of the user who sent the message.
   */
  readonly user_id!: number;

  /**
   * The user who sent the message.
   */
  readonly user!: User;

  /**
   * The unique identifier of the room where the message was sent.
   * Used to identify which chat room this message belongs to.
   */
  readonly room_id!: number;

  /**
   * The raw content of the message in Game Jolt's content format.
   * This is typically a JSON string that represents rich content including text, mentions, etc.
   * Use `textContent` property to get the plain text representation.
   */
  readonly content!: string;

  /**
   * The date and time when the message was logged on Game Jolt's servers.
   * This represents the server timestamp, not the local send time.
   */
  readonly logged_on!: Date;

  /**
   * The type of the message.
   */
  readonly type: MessageType;

  /**
   * Indicates if the message has been replied to already.
   */
  private replied = false;

  /**
   * Checks if this message is a chat invite.
   * @returns `true` if the message type is "invite", `false` otherwise.
   */
  get isInvite(): boolean {
    return this.type === "invite";
  }

  /**
   * Gets the parsed invite data from the message content.
   * Only available if the message is an invite type.
   * @returns The parsed invite object, or `null` if not an invite or parsing fails.
   */
  get inviteData(): { id: number } | null {
    if (!this.isInvite) {
      return null;
    }

    try {
      const invite = JSON.parse(this.content);
      const inviteId = invite?.content?.[0]?.attrs?.id;

      if (inviteId) {
        return { id: inviteId };
      }
    } catch (error) {
      this.client.logger.warn(
        `Failed to parse invite content: ${error.message}`,
      );
    }

    return null;
  }

  /**
   * Accepts the chat invitation if this message is an invite.
   * @returns A Promise that resolves when the invite is accepted, or rejects if not an invite or acceptance fails.
   *
   * @example
   * ```typescript
   * client.chat.on('notification', async (message: Message) => {
   *   if (message.isInvite) {
   *     try {
   *       await message.acceptInvite();
   *       console.log('Invite accepted successfully');
   *     } catch (error) {
   *       console.error('Failed to accept invite:', error.message);
   *     }
   *   }
   * });
   * ```
   */
  async acceptInvite(): Promise<void> {
    const inviteData = this.inviteData;

    if (!inviteData) {
      throw new Error(
        "This message is not a valid invite or invite data is malformed",
      );
    }

    await this.client.chat.acceptInvite(inviteData.id);
    this.client.logger.info(
      `Successfully accepted invite with ID: ${inviteData.id}`,
    );
  }

  /**
   * Gets the plain text content of the message.
   * Extracts text from Game Jolt's rich content format, removing formatting and mentions.
   *
   * @returns The plain text representation of the message content.
   */
  get textContent(): string {
    const doc = ContentDocument.fromJson(this.content);
    return this.extractTextContent(doc);
  }

  /**
   * Gets all users mentioned in this message.
   * Parses the message content to extract user mentions (@username).
   *
   * @returns An array of User objects representing mentioned users. Empty array if no mentions.
   */
  get mentions(): User[] {
    const doc = ContentDocument.fromJson(this.content);
    return this.extractMentions(doc);
  }

  /**
   * Checks if the current authenticated user is mentioned in this message.
   * Useful for implementing mention notifications or auto-responses.
   *
   * @returns `true` if the current user is mentioned, `false` otherwise.
   */
  get isMentioned(): boolean {
    return this.mentions.some((mention) => mention.id === this.client.userId);
  }

  /**
   * Checks if the message sender is the owner of the room.
   * Useful for implementing room-specific permissions or actions.
   *
   * @returns `true` if the sender is the room owner, `false` otherwise.
   */
  get isRoomOwner(): boolean {
    const room = this.client.chat.activeRooms.get(this.room_id);
    return room && this.user.id === room.owner_id;
  }

  /**
   * Checks if the message sender is blocked by the current authenticated user.
   * This is a convenient property that internally checks the BlockManager for the sender's user ID.
   *
   * @returns `true` if the sender is blocked, `false` otherwise.
   */
  get isAuthorBlocked(): boolean {
    return this.client.api.blocks.isUserBlocked(this.user_id);
  }

  /**
   * Gets the first mentioned user in the message, or the message author if no mentions exist.
   * Useful for targeting replies or getting a primary user to interact with.
   *
   * @returns The first mentioned user, or the message author as fallback.
   */
  get firstMentionOrAuthor(): User {
    let user = this.mentions[0];
    if (!user) {
      user = this.user;
    }

    return user;
  }

  /**
   * Creates a new Message instance.
   *
   * @param client - The Game Jolt client instance that owns this message.
   * @param data - Partial message data received from the Game Jolt API.
   */
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
   * Reply directly to this message in the same room.
   *
   * Note: This method has built-in safeguards:
   * - Prevents replying to your own messages
   * - Prevents multiple replies to the same message (sets internal replied flag)
   *
   * @param message - The content of the reply message. Can be plain text or rich Content object.
   * @returns A Promise that resolves to the sent Message, or `undefined` if reply was blocked.
   * @throws {Error} If there's an issue sending the message to Game Jolt.
   *
   * @example
   * ```typescript
   * // Reply with plain text
   * await message.reply('Thanks for the message!');
   *
   * // Reply with rich content
   * const content = new Content().insertText("Hello ").mention("user123");
   * await message.reply(content);
   * ```
   */
  async reply(message: string | Content): Promise<Message> {
    // Prevent replying to self.
    if (this.user.id === this.client.chat.currentUser.id || this.replied) {
      return;
    }

    return this.client.grid.chat.sendMessage(message, this.room_id);
  }

  /**
   * Edit the content of this message.
   *
   * Note: Only the original author can edit their own messages.
   * If the current user is not the author, this method will silently return without action.
   *
   * @param message - The new content for the message. Can be plain text or rich Content object.
   * @returns `void` - This method doesn't return the updated message.
   *
   * @example
   * ```typescript
   * // Edit with plain text
   * message.edit('Updated message content');
   *
   * // Edit with rich content
   * const newContent = new Content().text('Updated: ').bold('Important info');
   * message.edit(newContent);
   * ```
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
   * Extracts plain text content from a Game Jolt ContentDocument.
   * Recursively traverses the content structure to build a text-only representation.
   *
   * @param doc - The ContentDocument to extract text from.
   * @returns The concatenated text content without formatting or special elements.
   * @private
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
   * Extracts mentioned users from a Game Jolt ContentDocument.
   * Searches the hydration data for username entries and creates User instances.
   *
   * @param doc - The ContentDocument to extract mentions from.
   * @returns An array of User objects representing all mentioned users.
   * @private
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
