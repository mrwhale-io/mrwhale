import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt";
import * as profanity from "profanity-util";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "define",
      description: "Define a word or phrase.",
      type: "fun",
      usage: "<prefix>define <word>",
    });
  }

  async action(message: Message, args: string[]) {
    const phrase = args.join(" ");
    const url = `https://api.urbandictionary.com/v0/define?page=1&term=${phrase}`;

    if (!phrase) {
      return message.reply("You must pass word/phrase to define.");
    }

    const result = await axios.get(url);
    if (!result.data.list || !result.data.list[0]) {
      return message.reply("Could not define this.");
    }

    return message.reply(
      `${phrase} - ${profanity.purify(result.data.list[0].definition)[0]}`
    );
  }
}
