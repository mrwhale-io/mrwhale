import { Content, Message } from "@mrwhale-io/gamejolt";

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
    const uptime = TimeUtilities.convertMs(this.client.uptime);
    const content = new Content();
    content.insertText(`I have been up ${uptime.toString()}`);

    return message.reply(content);
  }
}
