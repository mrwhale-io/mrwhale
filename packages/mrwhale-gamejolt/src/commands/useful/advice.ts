import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "advice",
      description: "Get advice.",
      type: "useful",
      usage: "<prefix>advice",
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      const url = `https://api.adviceslip.com/advice`;
      const result = await axios.get(url);

      return message.reply(result.data.slip.advice);
    } catch {
      return message.reply("Could not fetch advice.");
    }
  }
}
