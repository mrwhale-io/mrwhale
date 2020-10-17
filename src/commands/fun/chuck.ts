import axios from "axios";
import { Content, Message } from "@mrwhale-io/gamejolt";

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
    const content = new Content();
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
    content.insertText(result.data.value.joke);

    return message.reply(content);
  }
}
