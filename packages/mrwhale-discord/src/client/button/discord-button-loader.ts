import { DiscordBotClient } from "../discord-bot-client";
import { BaseLoader } from "../base-loader";
import { DiscordButton } from "./discord-button";

/**
 * Class responsible for loading Discord buttons.
 */
export class DiscordButtonLoader extends BaseLoader<DiscordButton> {
  protected classType = DiscordButton;
  protected directory = this.botClient.buttonDir;
  protected collection = this.botClient.buttons;

  constructor(bot: DiscordBotClient) {
    super(bot);
  }

  /**
   * Registers the loaded button instance.
   * @param instance The loaded button instance.
   */
  protected register(instance: DiscordButton): void {
    instance.register(this.botClient);
  }
}
