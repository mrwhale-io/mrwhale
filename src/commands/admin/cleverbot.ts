import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "cleverbot",
      description: "Toggle cleverbot on/off.",
      type: "admin",
      usage: "<prefix>cleverbot",
      ownerOnly: true,
    });
  }

  async action(message: Message): Promise<void> {
    this.client.cleverbot = !this.client.cleverbot;

    if (this.client.cleverbot) {
      return message.reply("Cleverbot enabled.");
    } else {
      return message.reply("Cleverbot disabled.");
    }
  }
}
