import { KeyedStorageProvider, StorageProvider } from "@mrwhale-io/core";

import { DiscordBotClient } from "../discord-bot-client";
import { StorageProviders } from "../../types/storage-providers";

const CONCURRENCY_LIMIT = 10; // Number of concurrent operations
const CHUNK_SIZE = 100; // Number of guilds to process in one batch

/**
 * The GuildStorageLoader class is responsible for managing the loading and deletion
 * of storage settings for each guild the bot is a member of. This includes initializing
 * storage providers, loading settings from the database, and managing the storage settings
 * in memory for quick access.
 */
export class GuildStorageLoader {
  /**
   * Contains the settings storage provider used to interface with the database.
   */
  readonly settingsProvider: StorageProvider;

  /**
   * This map holds the storage settings for each guild, keyed by the guild's ID.
   */
  readonly guildSettings: Map<string, KeyedStorageProvider>;

  private readonly botClient: DiscordBotClient;

  constructor(client: DiscordBotClient) {
    this.botClient = client;
    this.settingsProvider = new this.botClient.provider(
      StorageProviders.GuildSettings
    );
    this.guildSettings = new Map<string, KeyedStorageProvider>();
  }

  /**
   * Initialise storage providers.
   */
  async init(): Promise<void> {
    await this.settingsProvider.init();
  }

  /**
   * Loads the settings for a specified guild if they are not already loaded.
   *
   * This method checks if the settings for the given guild Id are already loaded in the
   * guildSettings map. If not, it initializes a new KeyedStorageProvider for the guild,
   * loads the settings from the database, and stores them in the guildSettings map.
   *
   * @param guildId The Id of the guild to load settings for.
   * @returns A promise that resolves once the guild settings have been loaded.
   */
  async loadGuildSettings(guildId: string): Promise<void> {
    if (!this.guildSettings.has(guildId)) {
      const storage = new KeyedStorageProvider(this.settingsProvider, guildId);

      await storage.init();

      this.guildSettings.set(guildId, storage);
    }
  }

  /**
   * Deletes storage settings for a specified guild.
   *
   * This method checks if the settings for the given guild Id have been loaded.
   * If so it removes the guild settings from the database and deletes the settings from the
   * guildsettings map.
   *
   * @param guildId The Id of the guild to load settings for.
   * @returns A promise that resolves once the guild settings have been deleted.
   */
  async deleteGuildSettings(guildId: string): Promise<void> {
    if (this.guildSettings.has(guildId)) {
      await this.settingsProvider.remove(guildId);
      this.guildSettings.delete(guildId);
    }
  }

  /**
   * Loads and initializes storage settings for each guild the bot is a member of.
   *
   * This method iterates over all the guilds the bot is connected to and initializes
   * a storage provider for each guild. It processes the guilds in chunks to manage
   * load and limits the number of concurrent operations to avoid overwhelming the system.
   *
   * - If the bot is already tracking settings for a guild, it skips that guild.
   * - Uses a concurrency limit to ensure only a manageable number of operations run simultaneously.
   *
   * @returns A promise that resolves when all guild storages have been loaded.
   */
  async loadAllGuildSettings(): Promise<void> {
    const guildIds = Array.from(this.botClient.client.guilds.cache.keys());
    const existingGuildIds = new Set(this.guildSettings.keys());

    const guildsToLoad = guildIds.filter((id) => !existingGuildIds.has(id));

    // Function to process a chunk of guilds
    const processChunk = async (chunk: string[]) => {
      const storagePromises = chunk.map(async (guildId) => {
        const storage = new KeyedStorageProvider(
          this.settingsProvider,
          guildId
        );
        await storage.init();
        this.guildSettings.set(guildId, storage);
      });
      await Promise.all(storagePromises);
    };

    // Process the guilds in chunks
    for (let i = 0; i < guildsToLoad.length; i += CHUNK_SIZE) {
      const chunk = guildsToLoad.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        Array.from({ length: CONCURRENCY_LIMIT }, (_, index) =>
          processChunk(
            chunk.slice(index, index + CHUNK_SIZE / CONCURRENCY_LIMIT)
          )
        )
      );
    }
  }
}
