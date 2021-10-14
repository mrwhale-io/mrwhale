import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "chucknorris",
      description: "Get a random Chuck Norris joke.",
      type: "fun",
      usage: "<prefix>chucknorris <firstname> <lastname> <category>",
      aliases: ["chuck", "norris"],
      cooldown: 3000,
    });
  }

  async action(
    message: Message,
    [firstName, lastName, category]: [string, string, string]
  ): Promise<Message> {
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
