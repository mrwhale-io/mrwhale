import { KeyedStorageProvider, StorageProvider } from "@mrwhale-io/core";

import { GameJoltBotClient } from "../gamejolt-bot-client";

/**
 * Responsible for loading room settings.
 */
export class RoomStorageLoader {
  private readonly botClient: GameJoltBotClient;
  private readonly settingsProvider: StorageProvider;

  constructor(client: GameJoltBotClient) {
    this.botClient = client;
    this.settingsProvider = new this.botClient.provider("room_settings");
  }

  /**
   * Initialise storage providers.
   */
  async init(): Promise<void> {
    await this.settingsProvider.init();
  }

  /**
   * Loads the room settings.
   * @param roomId The identifier of the room.
   */
  async loadRoomSettings(roomId: number): Promise<void> {
    if (this.botClient.roomSettings.has(roomId)) {
      return;
    }

    const storage = new KeyedStorageProvider(
      this.settingsProvider,
      roomId.toString()
    );

    await storage.init();

    this.botClient.roomSettings.set(roomId, storage);
  }
}
