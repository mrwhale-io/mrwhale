import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "dadjoke",
      description: "Get a random Dad joke.",
      type: "fun",
      usage: "<prefix>dadjoke",
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
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
