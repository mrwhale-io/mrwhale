import { ActivityLoader } from "../activity/activity-loader";
import { BaseLoader } from "../base-loader";
import { DiscordButtonLoader } from "../button/discord-button-loader";
import { DiscordBotClient } from "../discord-bot-client";
import { DiscordSelectMenuLoader } from "../menu/discord-select-menu-loader";

/**
 * Manager responsible for initializing and loading all necessary loaders.
 */
export class LoaderManager {
  private loaders: BaseLoader<any>[];

  constructor(botClient: DiscordBotClient) {
    this.loaders = [
      new DiscordButtonLoader(botClient),
      new DiscordSelectMenuLoader(botClient),
      new ActivityLoader(botClient),
    ];
  }

  /**
   * Loads all classes using the configured loaders.
   */
  loadAll(): void {
    this.loaders.forEach((loader) => loader.loadClasses());
  }
}
