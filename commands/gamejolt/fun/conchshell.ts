import { Message } from "@mrwhale-io/gamejolt";

import conchshell from "../../shared/fun/conchshell";
import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "conchshell",
      description: "Ask the magic conchshell a question.",
      type: "fun",
      usage: "<prefix>conchshell",
      examples: ["<prefix>conchshell will i ever get married?"],
      aliases: ["conch"],
    });
  }

  action = async (message: Message, [question]: [string]): Promise<void> =>
    message.reply(conchshell(question));
}
