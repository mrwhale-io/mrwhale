import { TimeUtilities } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "newyear",
      description: "Countdown the new year.",
      type: "useful",
      usage: "<prefix>newyear",
      aliases: ["year"],
    });
  }

  async action(message: Message): Promise<Message> {
    const now = new Date();
    const next = new Date(now);
    next.setFullYear(now.getFullYear() + 1);
    next.setHours(0, 0, 0, 0);
    next.setMonth(0, 1);
    const ms = next.valueOf() - now.valueOf();
    const time = TimeUtilities.convertMs(ms);

    if (ms <= 0) {
      return message.reply(`Happy new year! 🎉🎆`);
    }

    return message.reply(`${time}until ${next.getFullYear()}!`);
  }
}
