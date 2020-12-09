import * as cleverbot from "cleverbot-node";
import { Message } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";

export class CleverbotPlugin {
  private bot: cleverbot;

  /**
   * @param client The bot client.
   * @param token The cleverbot api token.
   */
  constructor(private client: BotClient, token: string) {
    this.bot = new cleverbot();
    this.bot.configure({ botapi: token });
  }

  /**
   * Send message to cleverbot api and return response.
   * @param message The chat message to reply to.
   */
  speak(message: Message): Promise<string> {
    return new Promise((resolve) => {
      const user = this.client.chat.currentUser;
      const userRegex = new RegExp(
        `((@)*${user?.username}|${user?.display_name})`,
        "i"
      );
      this.bot.write(message.textContent.replace(userRegex, ""), (response) => {
        resolve(response.message);
      });
    });
  }
}
