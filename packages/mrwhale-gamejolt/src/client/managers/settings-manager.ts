import { Database } from "../../database/database";
import { Setting } from "../../database/entity/setting";

export class settingsManager {
  private settings: Map<number, unknown>;

  constructor() {
    this.settings = new Map();
  }

  async init(): Promise<void> {
    const results = await Database.connection.getRepository(Setting).find();

    for (const result of results) {
      const settings = JSON.parse(result.setting);

      this.settings.set(result.roomId, settings);
    }
  }

  get(roomId: number, key: string, defaultValue: unknown): unknown {
    const settings = this.settings.get(roomId);

    return settings
      ? typeof settings[key] !== "undefined"
        ? settings[key]
        : defaultValue
      : defaultValue;
  }

  set(roomId: number, key: string, value: unknown): void {
    let settings = this.settings.get(roomId);

    if (!settings) {
      settings = {};
      this.settings.set(roomId, settings);
    }
    settings[key] = value;
    const newSetting = { roomId, setting: JSON.stringify(settings) };

    Database.connection
      .createQueryBuilder()
      .insert()
      .into(Setting)
      .values(newSetting)
      .onConflict(`("roomId") DO UPDATE SET "setting" = :setting`)
      .setParameter("setting", newSetting.setting)
      .execute();
  }

  remove(roomId: number, key: string): unknown {
    const settings = this.settings.get(roomId);

    if (!settings || typeof settings[key] === "undefined") {
      return undefined;
    }
    const value = settings[key];
    settings[key] = undefined;
    const newSetting = { roomId: roomId, setting: JSON.stringify(settings) };

    Database.connection
      .createQueryBuilder()
      .insert()
      .into(Setting)
      .values(newSetting)
      .onConflict(`("roomId") DO UPDATE SET "setting" = :setting`)
      .setParameter("setting", newSetting.setting)
      .execute();

    return value;
  }

  clear(roomId: number): void {
    if (!this.settings.has(roomId)) {
      return;
    }
    this.settings.delete(roomId);
    Database.connection.getRepository(Setting).delete({
      roomId,
    });
  }
}
