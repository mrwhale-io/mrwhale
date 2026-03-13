import { KeyedStorageProvider, StorageProvider } from "@mrwhale-io/core";

import { GameJoltBotClient } from "../gamejolt-bot-client";

/**
 * RoomStorageLoader is responsible for loading and managing room-specific storage providers for the Game Jolt bot.
 * It initializes storage providers for room settings and ensures that they are available when needed.
 * This class abstracts away the details of how storage is managed and provides a simple interface for loading room settings.
 */
export class RoomStorageLoader {
  private readonly botClient: GameJoltBotClient;
  private readonly settingsProvider: StorageProvider;

  constructor(client: GameJoltBotClient) {
    this.botClient = client;
    this.settingsProvider = new this.botClient.provider("room_settings");
  }

  /**
   * Initializes the storage providers.
   */
  async init(): Promise<void> {
    await this.settingsProvider.init();
  }

  /**
   * Loads the room settings for a specific room ID. If the settings for the room are already loaded, it does nothing.
   * Otherwise, it creates a new KeyedStorageProvider for the room, initializes it, and stores it in the bot client's roomSettings map.
   * @param roomId The identifier of the room.
   * @returns A promise that resolves when the room settings are loaded.
   */
  async loadRoomSettings(roomId: number): Promise<void> {
    if (this.botClient.roomSettings.has(roomId)) {
      return;
    }

    const storage = new KeyedStorageProvider(
      this.settingsProvider,
      roomId.toString(),
    );

    await storage.init();

    this.botClient.roomSettings.set(roomId, storage);
  }
}
