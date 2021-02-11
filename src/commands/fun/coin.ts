import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "coin",
      description: "Flip a coin.",
      usage: "<prefix>coin",
      type: "fun",
      aliases: ["flip"],
    });
  }

  async action(message: Message): Promise<Message> {
    return Math.random() > 0.5
      ? message.reply(`🎲 Heads!`)
      : message.reply(`🎲 Tails!`);
  }
}
