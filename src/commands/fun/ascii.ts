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
    });
  }

  async action(message: Message, [text]: [string]) {
    if (!text) {
      return message.reply("Please provide some text.");
    }

    const content = new Content();
    const rendered = await figletAsync(text);

    const contentText = content.state.schema.text(`${rendered}`);
    const node = content.schema.nodes.codeBlock.create({}, [contentText]);
    content.insertNewNode(node);

    return message.reply(content);
  }
}
