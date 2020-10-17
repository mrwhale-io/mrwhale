import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { TimeUtilities } from "../../util/time";

export default class extends Command {
  constructor() {
    super({
      name: "uptime",
      description: "Get the time the bot has been up without downtime.",
      type: "info",
      usage: "<prefix>uptime",
    });
  }

  async action(message: Message) {
    return message.reply(
      `I have been up ${TimeUtilities.convertMs(this.client.uptime).toString()}`
    );
  }
}
