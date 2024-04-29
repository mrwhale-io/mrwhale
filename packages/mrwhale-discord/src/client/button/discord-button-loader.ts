import * as glob from "glob";

import { DiscordBotClient } from "../discord-bot-client";
import { DiscordButton } from "./discord-button";
import { loadButton } from "../../util/load-button";

/**
 * Responsible for loading discord buttons.
 */
export class DiscordButtonLoader {
  private botClient: DiscordBotClient;

  constructor(bot: DiscordBotClient) {
    this.botClient = bot;
  }

  /**
   * Loads all discord buttons from the button directory.
   */
  loadButtons(): void {
    const files = [];
    if (this.botClient.buttons.size > 0) {
      this.botClient.buttons.clear();
    }

    files.push(...glob.sync(`${this.botClient.buttonDir}/*.js`));
    if (this.botClient.tsNode) {
      files.push(...glob.sync(`${this.botClient.buttonDir}/*.ts`));
    }

    for (const file of files) {
      const commandLocation = file.replace(".ts", "");
      const loadedButton: any = loadButton(commandLocation);
      const button: DiscordButton = new loadedButton();
      this.botClient.buttons.set(button.name, button);
      button.register(this.botClient);

      this.botClient.logger.info(`Discord Button ${button.name} loaded`);
    }
  }
}
