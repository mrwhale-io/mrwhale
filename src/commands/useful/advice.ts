import axios from "axios";
import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "advice",
      description: "Get advice.",
      type: "useful",
      usage: "<prefix>advice",
    });
  }

  async action(message: Message): Promise<void> {
    try {
      const url = `https://api.adviceslip.com/advice`;
      const result = await axios.get(url);

      return message.reply(result.data.slip.advice);
    } catch {
      return message.reply("Could not fetch advice.");
    }
  }
}
