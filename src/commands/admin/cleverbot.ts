import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "cleverbot",
      description: "Toggle cleverbot on/off.",
      type: "admin",
      usage: "<prefix>cleverbot",
      admin: true,
    });
  }

  async action(message: Message): Promise<Message> {
    this.client.cleverbot = !this.client.cleverbot;

    if (this.client.cleverbot) {
      return message.reply("Cleverbot enabled.");
    } else {
      return message.reply("Cleverbot disabled.");
    }
  }
}
