import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "fact",
      description: "Get a random useless fact.",
      type: "fun",
      usage: "<prefix>fact",
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      const url = `https://uselessfacts.jsph.pl/random.json?language=en`;
      const result = await axios.get(url);

      return message.reply(result.data.text);
    } catch {
      return message.reply("Could not fetch a fact.");
    }
  }
}
