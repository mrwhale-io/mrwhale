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
      usage: "<prefix>ascii <text>",
    });
  }

  async action(message: Message, [text]: [string]) {
    const content = new Content();
    if (!text) {
      content.insertText("Please provide some text.");
      return message.reply(content);
    }

    const rendered = await figletAsync(text);

    const contentText = content.state.schema.text(`${rendered}`);
    const node = content.schema.nodes.codeBlock.create({}, [contentText]);
    content.insertNewNode(node);

    return message.reply(content);
  }
}
