import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Sends back a pong response.",
      usage: "<prefix>ping",
    });
  }

  async action(message: Message): Promise<void> {
    const start = process.hrtime();
    const end = process.hrtime(start);
    const content = new Content();
    content.insertText(`Pong! Execution time ${end[0]}s ${end[1] / 1000000}ms`);

    return message.reply(content);
  }
}
