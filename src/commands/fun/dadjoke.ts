import axios from "axios";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "dadjoke",
      description: "Get a random Dad joke.",
      type: "fun",
      usage: "<prefix>dadjoke",
    });
  }

  async action(message: Message) {
    const content = new Content();
    const url = `https://icanhazdadjoke.com/`;
    const result = await axios.get(url, {
      headers: {
        accept: "application/json",
      },
    });
    content.insertText(result.data.joke);

    return message.reply(content);
  }
}
