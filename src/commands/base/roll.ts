import * as d20 from "d20";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "roll",
      description: "Roll one or multiple dice.",
      usage: "<prefix>roll [n sides] or [n dice] d[n sides]",
    });
  }

  async action(message: Message, args: string[]) {
    const max = 20;
    const content = new Content();
    let passed = true;

    if (!args || args.length < 1) {
      content.insertText(`🎲 You rolled a ${d20.roll("6")}`);
      return message.reply(content);
    }

    if (args[0].split("d").length <= 1) {
      content.insertText(`🎲 You rolled a ${d20.roll(args[0] || "6")}`);

      return message.reply(content);
    } else {
      for (let i = 0; i < args.length; i++) {
        const current = parseInt(args[i].split("d")[0], 10);
        if (current > max) {
          passed = false;
        }
      }

      if (passed) {
        content.insertText(
          `🎲 You rolled a ${d20.roll(args.toString().replace(",", "+"), true)}`
        );

        return message.reply(content);
      } else {
        content.insertText(`You tried to roll too many dice at once.`);

        return message.reply(content);
      }
    }
  }
}
