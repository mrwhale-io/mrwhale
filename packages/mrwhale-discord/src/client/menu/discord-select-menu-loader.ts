import * as glob from "glob";

import { DiscordBotClient } from "../discord-bot-client";
import { loadSelectMenu } from "../../util/menu/load-select-menu";
import { DiscordSelectMenu } from "./discord-select-menu";

/**
 * Responsible for loading discord select menus.
 */
export class DiscordSelectMenuLoader {
  private botClient: DiscordBotClient;

  constructor(bot: DiscordBotClient) {
    this.botClient = bot;
  }

  /**
   * Loads all discord select menus from the menus directory.
   */
  loadMenus(): void {
    const files = [];
    if (this.botClient.menus.size > 0) {
      this.botClient.menus.clear();
    }

    files.push(...glob.sync(`${this.botClient.selectMenuDir}/*.js`));
    if (this.botClient.tsNode) {
      files.push(...glob.sync(`${this.botClient.selectMenuDir}/*.ts`));
    }

    for (const file of files) {
      const commandLocation = file.replace(".ts", "");
      const loadedSelectMenu: any = loadSelectMenu(commandLocation);
      const selectMenu: DiscordSelectMenu = new loadedSelectMenu();
      this.botClient.menus.set(selectMenu.name, selectMenu);
      selectMenu.register(this.botClient);

      this.botClient.logger.info(
        `Discord Select Menu ${selectMenu.name} loaded`
      );
    }
  }
}
