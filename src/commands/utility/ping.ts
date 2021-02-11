import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Sends back a pong response.",
      type: "utility",
      usage: "<prefix>ping",
    });
  }

  async action(message: Message): Promise<Message> {
    const start = process.hrtime();
    const end = process.hrtime(start);

    return message.reply(
      `Pong! Execution time ${end[0]}s ${end[1] / 1000000}ms`
    );
  }
}
