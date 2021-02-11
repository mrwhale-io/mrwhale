import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "conchshell",
      description: "Ask the magic conchshell a question.",
      type: "fun",
      usage: "<prefix>conchshell",
      examples: ["<prefix>conchshell will i ever get married?"],
      aliases: ["conch"],
    });
  }

  async action(message: Message, [question]: [string]): Promise<Message> {
    if (!question) {
      return message.reply(`Ask the magic conch shell a question.`);
    }

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
      return message.reply(`🐚 Nothing.`);
    }

    if (
      message.textContent.match(/(will\si\s(?:ever)?\s*get\smarried(\?*))/gi)
    ) {
      return message.reply(`🐚 Maybe someday.`);
    }

    return message.reply(`🐚 ${conchShellResponses[index]}`);
  }
}
