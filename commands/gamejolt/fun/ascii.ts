import { Content, Message } from "@mrwhale-io/gamejolt";
import * as figlet from "figlet";
import * as util from "util";

import { Command } from "../command";

const figletAsync = util.promisify(figlet);

export default class extends Command {
  constructor() {
    super({
      name: "ascii",
      description: "Generate ascii.",
      type: "fun",
      usage: "<prefix>ascii <text>",
      examples: ["<prefix>ascii Mr. Whale"],
      cooldown: 5000,
    });
  }

  async action(message: Message, [text]: [string]): Promise<void> {
    if (!text) {
      return message.reply("Please provide some text.");
    }

    const rendered = await figletAsync(text);
    const content = new Content().insertCodeBlock(`${rendered}`);

    return message.reply(content);
  }
}
