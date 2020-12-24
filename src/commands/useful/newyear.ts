import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { TimeUtilities } from "../../util/time";

export default class extends Command {
  constructor() {
    super({
      name: "newyear",
      description: "Countdown the new year.",
      type: "useful",
      usage: "<prefix>newyear",
      aliases: ["year"],
    });
  }

  async action(message: Message): Promise<void> {
    const today = new Date();
    let deadline = "January 1 " + (today.getFullYear() + 1) + " 00:00:00";
    if (today.getMonth() === 0 && today.getDate() === 1) {
      deadline = "January 1 " + today.getFullYear() + " 00:00:00";
    }
    const ms = Date.parse(deadline) - Date.now();
    const time = TimeUtilities.convertMs(ms);

    if (ms <= 0) {
      return message.reply(`Happy new year! 🎉🎆`);
    }

    return message.reply(`${time.toString()} until the new year!`);
  }
}
