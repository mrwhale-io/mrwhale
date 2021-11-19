import { SimpleStorageProvider, StorageProvider } from "@mrwhale-io/core";

import { GameJoltBotClient } from "../client/gamejolt-bot-client";

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
   */
  async loadRoomSettings(roomId: number): Promise<void> {
    if (this.botClient.roomSettings.has(roomId)) {
      return;
    }

    const storage = new SimpleStorageProvider(
      this.settingsProvider,
      roomId.toString()
    );

    await storage.init();

    this.botClient.roomSettings.set(roomId, storage);
  }
}
