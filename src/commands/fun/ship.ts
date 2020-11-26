import crypto = require("crypto");
import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "ship",
      description: "Find out how compatible two users are.",
      type: "fun",
      usage: "<prefix>ship person1, person2",
      examples: ["<prefix>ship Mr. Whale, Mrs. Whale"],
    });
  }

  async action(message: Message, [firstUser, secondUser]: [string, string]) {
    if (!firstUser) {
      return message.reply("First user is missing.");
    }

    if (!secondUser) {
      return message.reply("Second user is missing.");
    }

    const users = [
      firstUser.trim().toLowerCase(),
      secondUser.trim().toLowerCase(),
    ].sort();

    const hash = crypto
      .createHash("md5")
      .update(users.toString())
      .digest("hex");

    const result = hash
      .split("")
      .filter((h) => !isNaN(parseInt(h, 10)))
      .join("");

    const percent = parseInt(result.substr(0, 2), 10);

    return message.reply(
      `💘 There's a ${percent}% match between ${firstUser} and ${secondUser} 💘`
    );
  }
}
