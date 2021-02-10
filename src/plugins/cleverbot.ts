import * as cleverbot from "cleverbot-node";

export class CleverbotPlugin {
  private bot: cleverbot;

  /**
   * @param token The cleverbot api token.
   */
  constructor(token: string) {
    this.bot = new cleverbot();
    this.bot.configure({ botapi: token });
  }

  /**
   * Send message to cleverbot api and return response.
   * @param message The chat message to reply to.
   */
  speak(message: string): Promise<string> {
    return new Promise((resolve) => {
      this.bot.write(message, (response) => {
        resolve(response.message);
      });
    });
  }
}
