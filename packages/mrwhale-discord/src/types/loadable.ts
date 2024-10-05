import { DiscordBotClient } from "../client/discord-bot-client";

/**
 * Represents a loadable component that can be registered with a Discord bot client.
 * @template T The type of the loadable component.
 */
export abstract class Loadable<T = string> {
  /**
   * The name of the loadable component.
   */
  readonly name: T;

  /**
   * An instance of the current Discord bot client.
   */
  protected botClient: DiscordBotClient;

  constructor(name: T) {
    this.name = name;
  }

  /**
   * Registers the loadable component with the specified Discord bot client.
   * @param client The Discord bot client to register the loadable component with.
   */
  register(client: DiscordBotClient): void {
    this.botClient = client;
    if (!this.name) {
      const parentClass = Object.getPrototypeOf(this.constructor);
      throw new Error(`${parentClass.name} must have a name.`);
    }
  }
}
