import * as glob from "glob";

import { DiscordBotClient } from "./discord-bot-client";
import { loadClass } from "../util/load-class";
import { AbstractOrConcreteConstructor } from "../types/constructor-types";

/**
 * Base class for loading different types of classes (e.g., commands, select menus).
 */
export abstract class BaseLoader<T> {
  /**
   * The instance of the Discord bot client.
   */
  protected botClient: DiscordBotClient;

  /**
   * The type of class that this loader is responsible for loading.
   */
  protected abstract classType: AbstractOrConcreteConstructor<T>;

  /**
   * The directory where the classes are located.
   */
  protected abstract directory: string;

  /**
   * The collection (map) where the loaded instances are stored.
   */
  protected abstract collection: Map<string, T>;

  constructor(bot: DiscordBotClient) {
    this.botClient = bot;
  }

  /**
   * Loads all classes from the specified directory.
   * This method clears the existing collection, finds all relevant files,
   * loads each class, creates an instance, stores it in the collection,
   * and registers it.
   */
  loadClasses(): void {
    const files = [];
    // Clear the collection before loading new classes.
    if (this.collection.size > 0) {
      this.collection.clear();
    }

    // Find all relevant files in the directory.
    files.push(...glob.sync(`${this.directory}/*.js`));
    if (this.botClient.tsNode) {
      files.push(...glob.sync(`${this.directory}/*.ts`));
    }

    // Load each class, create an instance, store it in the collection, and register it.
    for (const file of files) {
      const classLocation = file.replace(".ts", "");
      const LoadedClass = loadClass<T>(classLocation, this.classType);
      const instance = new LoadedClass();
      this.collection.set((instance as any).name, instance);
      this.register(instance);

      this.botClient.logger.info(
        `${this.classType.name} ${(instance as any).name} loaded`
      );
    }
  }

  /**
   * Abstract method to register the loaded instance.
   * @param instance The loaded instance.
   */
  protected abstract register(instance: T): void;
}
