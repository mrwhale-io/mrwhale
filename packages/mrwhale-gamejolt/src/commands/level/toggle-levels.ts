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
    let enabled = this.botClient.settings.get(message.room_id, "levels", true);
    enabled = !enabled;
    this.botClient.settings.set(message.room_id, "levels", enabled);

    return enabled
      ? message.reply("Levels enabled.")
      : message.reply("Levels disabled.");
  }
}
