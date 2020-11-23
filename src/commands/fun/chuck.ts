import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "chucknorris",
      description: "Get a random Chuck Norris joke.",
      type: "fun",
      usage: "<prefix>chucknorris <firstname> <lastname> <category>",
      aliases: ["chuck", "norris"],
    });
  }

  async action(
    message: Message,
    [firstName, lastName, category]: [string, string, string]
  ) {
    let url = `http://api.icndb.com/jokes/random?escape=javascript`;

    if (firstName) {
      url += `&firstName=${firstName}`;
    }

    if (lastName) {
      url += `&lastName=${lastName}`;
    }

    if (category) {
      url += `&category=[${category}]`;
    }

    try {
      const { data } = await axios.get(url);
      if (!data.value || !data.value.joke) {
        return message.reply("Could not fetch chuck norris joke.");
      }
      return message.reply(data.value.joke);
    } catch {
      return message.reply("Could not fetch chuck norris joke.");
    }
  }
}
