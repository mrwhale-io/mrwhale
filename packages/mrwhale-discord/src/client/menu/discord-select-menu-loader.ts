import { DiscordBotClient } from "../discord-bot-client";
import { DiscordSelectMenu } from "./discord-select-menu";
import { BaseLoader } from "../base-loader";

/**
 * Class responsible for loading Discord select menus.
 */
export class DiscordSelectMenuLoader extends BaseLoader<DiscordSelectMenu> {
  protected classType = DiscordSelectMenu;
  protected directory = this.botClient.selectMenuDir;
  protected collection = this.botClient.menus;

  constructor(bot: DiscordBotClient) {
    super(bot);
  }

  /**
   * Registers the loaded select menu instance.
   * @param instance The loaded select menu instance.
   */
  protected register(instance: DiscordSelectMenu): void {
    instance.register(this.botClient);
  }
}
