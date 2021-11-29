import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "togglelevels",
      description: "Toggle levels on and off.",
      type: "level",
      usage: "<prefix>togglelevels",
      owner: true,
      groupOnly: true,
    });
  }

  async action(message: Message): Promise<Message> {
    let enabled = await this.isLevelsEnabled(message.room_id);
    enabled = !enabled;

    const settings = this.botClient.roomSettings.get(message.room_id);

    if (settings) {
      settings.set("levels", enabled);
    }

    return enabled
      ? message.reply("Levels enabled.")
      : message.reply("Levels disabled.");
  }

  private async isLevelsEnabled(roomId: number): Promise<boolean> {
    if (!this.botClient.roomSettings.has(roomId)) {
      return true;
    }

    const settings = this.botClient.roomSettings.get(roomId);

    return await settings.get("levels", true);
  }
}
