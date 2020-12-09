import { Message, Content } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

import * as util from "util";
import * as config from "../../../config.json";

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

  async action(message: Message, args: string[]): Promise<void> {
    const input = args.join();
    const content = new Content();

    if (!input) {
      return message.reply("Please pass code to eval.");
    }

    try {
      let output = eval(input);
      if (typeof output !== "string") {
        output = util.inspect(output, { depth: 0 });
      }

      if (output.includes(config.frontend)) {
        output = output.replace(config.frontend, "removed");
      }

      content.insertCodeBlock(output);

      return message.reply(content);
    } catch (error) {
      content.insertCodeBlock(
        error.toString().replace(config.frontend, "removed")
      );

      return message.reply(content);
    }
  }
}
