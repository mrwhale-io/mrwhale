import * as figlet from "figlet";
import * as util from "util";

import { codeBlock, CommandOptions } from "@mrwhale-io/core";

const figletAsync = util.promisify(figlet);

export const MAX_ASCII_LENGTH = 10;

export const data: CommandOptions = {
  name: "ascii",
  description: "Generate ascii art from text.",
  type: "fun",
  usage: "<prefix>ascii <text>",
  examples: ["<prefix>ascii Mr. Whale"],
  cooldown: 5000,
};

export async function action(text: string): Promise<string> {
  if (!text) {
    return "Please provide some text.";
  }

  if (text.length > MAX_ASCII_LENGTH) {
    return `Text must be ${MAX_ASCII_LENGTH} characters or less.`;
  }

  const result = (await figletAsync(text)) as string;

  if (!result) {
    return "Could not parse input.";
  }

  return codeBlock(result);
}
