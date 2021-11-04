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

    this.botClient.settings.set(message.room_id, "prefix", prefix);

    return message.reply("Successfully set the prefix for this room.");
  }
}
