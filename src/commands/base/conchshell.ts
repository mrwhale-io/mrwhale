import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "conchshell",
      description: "Ask the magic conchshell a question.",
      usage: "<prefix>conchshell",
    });
  }

  async action(message: Message) {
    const content = new Content();
    const conchShellResponses = [
      `I don't think so.`,
      `Yes.`,
      `Try asking again.`,
      `No.`,
    ];
    const index = Math.floor(Math.random() * conchShellResponses.length);

    if (
      message.textContent.match(/w(?:o|u|ha)t\s(?:do|to|(?:sh|w)ould)[\s\S]*/gi)
    ) {
      content.insertText(`🐚 Nothing.`);
      return message.reply(content);
    }

    if (
      message.textContent.match(/(will\si\s(?:ever)?\s*get\smarried(\?*))/gi)
    ) {
      content.insertText(`🐚 Maybe someday.`);
      return message.reply(content);
    }
    content.insertText(`🐚 ${conchShellResponses[index]}`);

    return message.reply(content);
  }
}
