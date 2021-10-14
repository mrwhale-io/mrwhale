import { Message } from "@mrwhale-io/gamejolt-client";
import * as figlet from "figlet";
import * as util from "util";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { codeBlock } from '../../util/markdown-helpers';

const figletAsync = util.promisify(figlet);

export default class extends GameJoltCommand {
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

  async action(message: Message, [text]: [string]): Promise<Message> {
    if (!text) {
      return message.reply("Please provide some text.");
    }

    const rendered = await figletAsync(text);

    return message.reply(codeBlock(`${rendered}`));
  }
}
