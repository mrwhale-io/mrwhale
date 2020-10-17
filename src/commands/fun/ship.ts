import crypto = require("crypto");
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "ship",
      description: "Find out how compatible two users are.",
      type: "fun",
      usage: "<prefix>ship person1, person2",
    });
  }

  async action(message: Message, [firstUser, secondUser]: [string, string]) {
    const content = new Content();
    if (!firstUser) {
      content.insertText("First user is missing.");
      return message.reply(content);
    }

    if (!secondUser) {
      content.insertText("Second user is missing.");
      return message.reply(content);
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

    content.insertText(
      `💘 There's a ${percent}% match between ${firstUser} and ${secondUser} 💘`
    );

    return message.reply(content);
  }
}
