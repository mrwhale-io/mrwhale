import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "translatewhale",
      description: "Translate whale sounds into human speech.",
      usage: "!translatewhale <whale speak>",
      type: "useful",
      aliases: ["whaletranslate"],
    });
  }

  async action(message: Message, [text]: [string]): Promise<Message> {
    const translation = this.botClient.chat.whaleTranslationMap.get(
      text.trim()
    );
    const couldNotDecodeResponses = [
      "Hmm... I couldn't decode that whale talk.",
      "I'm sorry, I couldn't translate that whale speak.",
      "I'm having trouble translating that whale speak.",
      "What is this gibberish? I can't translate that.",
    ];
    const couldNotDecodeResponse =
      couldNotDecodeResponses[
        Math.floor(Math.random() * couldNotDecodeResponses.length)
      ];

    const markdownRegex = /(\*\*|__|~~|`|```|#|\[.*?\]\(.*?\))/; // Common Markdown patterns
    const containsMarkdown = translation
      ? markdownRegex.test(typeof translation === "string" ? translation : "")
      : false;

    const translatedText = translation
      ? containsMarkdown
        ? translation
        : `📜 Translation: ${translation}`
      : couldNotDecodeResponse;

    return message.reply(translatedText, false);
  }
}
