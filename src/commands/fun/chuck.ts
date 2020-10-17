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

    const result = await axios.get(url);

    return message.reply(result.data.value.joke);
  }
}
