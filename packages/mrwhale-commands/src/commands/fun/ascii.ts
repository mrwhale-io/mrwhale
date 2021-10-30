import { codeBlock, CommandOptions } from "@mrwhale-io/core";
import * as figlet from "figlet";
import * as util from "util";

const figletAsync = util.promisify(figlet);

export const data: CommandOptions = {
  name: "ascii",
  description: "Generate ascii.",
  type: "fun",
  usage: "<prefix>ascii <text>",
  examples: ["<prefix>ascii Mr. Whale"],
  cooldown: 5000,
};

export async function action(text: string): Promise<unknown> {
  if (!text) {
    return "Please provide some text.";
  }

  const result = (await figletAsync(text)) as string;

  return codeBlock(result);
}
