import { Message } from "@mrwhale-io/gamejolt";
import * as math from "mathjs";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "calculate",
      description: "A calculator.",
      type: "useful",
      usage: "<prefix>calculate <calculation>",
    });
  }

  private replaceOperations(expression: string) {
    return expression
      .replace(/[,]/g, ".")
      .replace(/[x]/gi, "*")
      .replace(/[[÷]/gi, "/");
  }

  async action(message: Message, [expression]: [string]) {
    if (!expression) {
      return message.reply("Please enter a calculation.");
    }

    try {
      let result = math.evaluate(this.replaceOperations(expression));

      return message.reply(result.toString());
    } catch (e) {
      return message.reply("Invalid calculation.");
    }
  }
}
