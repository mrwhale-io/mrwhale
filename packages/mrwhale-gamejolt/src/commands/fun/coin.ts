import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
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
