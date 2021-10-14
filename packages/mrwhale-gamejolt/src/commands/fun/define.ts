import axios from "axios";
import { truncate } from "@mrwhale-io/core";
import { Content, Message } from "@mrwhale-io/gamejolt-client";
import * as profanity from "profanity-util";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "define",
      description: "Define a word or phrase.",
      type: "fun",
      usage: "<prefix>define <word>",
      examples: ["<prefix>define whale"],
      aliases: ["ud", "dictionary"],
      cooldown: 3000,
    });
  }

  async action(message: Message, [phrase]: [string]): Promise<Message> {
    const url = `https://api.urbandictionary.com/v0/define?page=1&term=${phrase}`;

    if (!phrase) {
      return message.reply("You must pass word/phrase to define.");
    }

    try {
      const { data } = await axios.get(url);
      if (!data.list || !data.list[0]) {
        return message.reply("Could not define this.");
      }
      const definition = data.list[0].definition;
      const maxLength = 997;
      const content = new Content().insertText(
        truncate(maxLength, profanity.purify(`${phrase} - ${definition}`)[0])
      );

      return message.reply(content);
    } catch {
      return message.reply("Could not fetch this definition.");
    }
  }
}
