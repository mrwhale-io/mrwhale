import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "prefix",
      description: "Sets the bot prefix.",
      type: "utility",
      usage: "<prefix>prefix <prefix>",
      owner: true,
    });
  }

  async action(message: Message, [prefix]: [string]): Promise<Message> {
    if (!prefix) {
      return message.reply("Please provide a prefix");
    }

    if (prefix.length > 10) {
      return message.reply("Please provide a prefix less than 10 characters.");
    }

    const settings = this.botClient.roomSettings.get(message.room_id);

    if (settings) {
      settings.set("prefix", prefix);
      return message.reply("Successfully set the prefix for this room.");
    } else {
      return message.reply("Could not set prefix for this room.");
    }
  }
}
