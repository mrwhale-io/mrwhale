import { Content, Message } from "@mrwhale-io/gamejolt";
import * as math from "mathjs";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "calculate",
      description: "A calculator.",
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
    const content = new Content();

    if (!expression) {
      content.insertText("Please enter a calculation.");
      return message.reply(content);
    }

    try {
      let result = math.evaluate(this.replaceOperations(expression));
      content.insertText(result.toString());

      return message.reply(content);
    } catch (e) {
      content.insertText("Invalid calculation.");

      return message.reply(content);
    }
  }
}
