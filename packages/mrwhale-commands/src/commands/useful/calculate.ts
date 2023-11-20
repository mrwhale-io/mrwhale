import { evaluate } from "mathjs";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "calculate",
  description:
    "A calculator supporting basic arithmetic, functions, and unit conversions.",
  type: "useful",
  usage: "<prefix>calculate <calculation>",
  examples: [
    "<prefix>calculate 12 / (2.3 + 0.7)",
    "<prefix>calculate sin(45 deg) ^ 2",
    "<prefix>calculate 12.7 cm to inch",
  ],
  aliases: ["calc"],
};

export function action(expression: string): string {
  if (!expression) {
    return "Please enter a calculation.";
  }

  try {
    const result = evaluate(replaceOperations(expression));
    return result.toString();
  } catch (error) {
    return `Invalid calculation: ${error.message}`;
  }
}

function replaceOperations(expression: string): string {
  return expression
    .replace(/[,]/g, ".")
    .replace(/[x]/gi, "*")
    .replace(/[[÷]/gi, "/");
}
