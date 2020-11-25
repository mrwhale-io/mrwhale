import { Message, Content } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

const config = require("../../../config.json");

export default class extends Command {
  constructor() {
    super({
      name: "eval",
      description: "Evaluate JavaScript code and execute it.",
      type: "admin",
      usage: "<prefix>eval <code>",
      ownerOnly: true,
    });
  }

  async action(message: Message, args: string[]) {
    const input = args.join();
    const content = new Content();

    if (!input) {
      return message.reply("Please pass code to eval.");
    }

    try {
      let output = eval(input);
      if (typeof output !== "string") {
        output = require("util").inspect(output, { depth: 0 });
      }

      if (output.includes(config.frontend)) {
        output = output.replace(config.frontend, "removed");
      }

      content.insertCodeBlock(output);

      return message.reply(content);
    } catch (error) {
      error = error.toString();
      if (error.includes(config.frontend)) {
        error = error.replace(config.frontend, "removed");
      }

      content.insertCodeBlock(error);

      return message.reply(content);
    }
  }
}
