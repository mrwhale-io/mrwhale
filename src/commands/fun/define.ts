import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt";
import * as profanity from "profanity-util";

import { Command } from "../command";
import { truncate } from "../../util/truncate";

export default class extends Command {
  constructor() {
    super({
      name: "define",
      description: "Define a word or phrase.",
      type: "fun",
      usage: "<prefix>define <word>",
      examples: ["<prefix>define whale"],
      aliases: ["ud", "dictionary"],
    });
  }

  async action(message: Message, [phrase]: [string]): Promise<void> {
    const url = `https://api.urbandictionary.com/v0/define?page=1&term=${phrase}`;

    if (!phrase) {
      return message.reply("You must pass word/phrase to define.");
    }

    try {
      const { data } = await axios.get(url);
      if (!data.list || !data.list[0]) {
        return message.reply("Could not define this.");
      }
      const definition = profanity.purify(data.list[0].definition)[0];
      const maxLength = 997;

      return message.reply(truncate(maxLength, `${phrase} - ${definition}`));
    } catch {
      return message.reply("Could not fetch this definition.");
    }
  }
}
