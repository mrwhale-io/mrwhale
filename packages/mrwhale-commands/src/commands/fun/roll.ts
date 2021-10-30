import * as d20 from "d20";
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "roll",
  description: "Roll one or multiple dice.",
  type: "fun",
  examples: ["<prefix>roll 5", "<prefix>roll 5 d10"],
  usage: "<prefix>roll [n sides] or [n dice] d[n sides]",
  aliases: ["dice"],
};

const DICE_MAX = 20;

export function action(args: string[]): string {
  console.log(args);
  let passed = true;
  if (!args || args.length < 1) {
    return `🎲 You rolled a ${d20.roll("6")}`;
  }

  if (args[0].split("d").length <= 1) {
    return `🎲 You rolled a ${d20.roll(args[0] || "6")}`;
  } else {
    for (let i = 0; i < args.length; i++) {
      const current = parseInt(args[i].split("d")[0], 10);
      if (current > DICE_MAX) {
        passed = false;
      }
    }

    return passed
      ? `🎲 You rolled a ${d20.roll(args.toString().replace(",", "+"), true)}`
      : `You tried to roll too many dice at once.`;
  }
}
