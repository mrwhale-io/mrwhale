import { KeyedStorageProvider, StorageProvider } from "@mrwhale-io/core";

import { DiscordBotClient } from "../discord-bot-client";

/**
 * Responsible for loading guild settings.
 */
export class GuildStorageLoader {
  private readonly botClient: DiscordBotClient;
  private readonly settingsProvider: StorageProvider;

  constructor(client: DiscordBotClient) {
    this.botClient = client;
    this.settingsProvider = new this.botClient.provider("guild_settings");
  }

  /**
   * Initialise storage providers.
   */
  async init(): Promise<void> {
    await this.settingsProvider.init();
  }

  /**
   * Loads the guild settings.
   */
  async loadStorages(): Promise<void> {
    for (const guild of this.botClient.client.guilds.cache.values()) {
      if (this.botClient.guildSettings.has(guild.id)) {
        continue;
      }

      const storage = new KeyedStorageProvider(this.settingsProvider, guild.id);

      await storage.init();

      this.botClient.guildSettings.set(guild.id, storage);
    }
  }
}
