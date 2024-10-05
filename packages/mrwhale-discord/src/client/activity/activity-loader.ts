import { BaseLoader } from "../base-loader";
import { DiscordBotClient } from "../discord-bot-client";
import { ActivityHandler } from "./activity-handler";

/**
 * Responsible for loading activities.
 */
export class ActivityLoader extends BaseLoader<ActivityHandler> {
  protected classType = ActivityHandler;
  protected directory = this.botClient.activitiesDir;
  protected collection = this.botClient.activities;

  constructor(bot: DiscordBotClient) {
    super(bot);
  }

  /**
   * Registers the loaded activity instance.
   * @param instance The loaded activity instance.
   */
  protected register(instance: ActivityHandler): void {
    instance.register(this.botClient);
  }
}
