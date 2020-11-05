import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt";

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
    try {
      const url = `https://icanhazdadjoke.com/`;
      const result = await axios.get(url, {
        headers: {
          accept: "application/json",
        },
      });

      return message.reply(result.data.joke);
    } catch {
      return message.reply("Could not fetch dad joke.");
    }
  }
}
