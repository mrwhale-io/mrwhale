import { Message } from "@mrwhale-io/gamejolt-client";
import { codeBlock } from "@mrwhale-io/core";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

import * as util from "util";
import * as config from "../../../config.json";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "eval",
      description: "Evaluate JavaScript code and execute it.",
      type: "admin",
      usage: "<prefix>eval <code>",
      admin: true,
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    const input = args.join();

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

      return message.reply(codeBlock(output, "js"));
    } catch (error) {
      return message.reply(
        codeBlock(error.toString().replace(config.frontend, "removed"))
      );
    }
  }
}
