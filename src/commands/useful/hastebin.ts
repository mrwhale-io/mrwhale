import { Content, Message } from "@mrwhale-io/gamejolt";
import axios from "axios";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "hastebin",
      description: "Upload text to hastebin.",
      type: "useful",
      usage: "<prefix>hastebin <paste>",
      examples: ["<prefix>hastebin Here is some text."],
    });
  }

  async action(message: Message, [text]: [string]): Promise<void> {
    if (!text || text === "") {
      return message.reply("Please provide text to upload.");
    }

    const url = "https://hasteb.in/documents";
    const config = {
      headers: {
        "Content-Type": "text/plain",
      },
    };

    try {
      const result = await axios.post(url, text, config);

      if (!result.data.key) {
        return message.reply("Could not upload text.");
      }

      const content = new Content();
      const link = `https://hasteb.in/${result.data.key}`;
      content.insertText(link, [content.autoLink(link, link)]);

      return message.reply(content);
    } catch {
      return message.reply("Could not upload text.");
    }
  }
}
