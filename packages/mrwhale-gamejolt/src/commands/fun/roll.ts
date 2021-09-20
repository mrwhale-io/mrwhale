import * as d20 from "d20";
import { Message } from "@mrwhale-io/gamejolt-client";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "roll",
      description: "Roll one or multiple dice.",
      type: "fun",
      examples: ["<prefix>roll 5", "<prefix>roll 5 d10"],
      usage: "<prefix>roll [n sides] or [n dice] d[n sides]",
      aliases: ["dice"],
    });
  }

  async action(message: Message, args: string[]): Promise<Message> {
    const max = 20;
    let passed = true;

    if (!args || args.length < 1) {
      return message.reply(`🎲 You rolled a ${d20.roll("6")}`);
    }

    if (args[0].split("d").length <= 1) {
      return message.reply(`🎲 You rolled a ${d20.roll(args[0] || "6")}`);
    } else {
      for (let i = 0; i < args.length; i++) {
        const current = parseInt(args[i].split("d")[0], 10);
        if (current > max) {
          passed = false;
        }
      }

      if (passed) {
        return message.reply(
          `🎲 You rolled a ${d20.roll(args.toString().replace(",", "+"), true)}`
        );
      } else {
        return message.reply(`You tried to roll too many dice at once.`);
      }
    }
  }
}
