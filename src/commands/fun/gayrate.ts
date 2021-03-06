import crypto = require("crypto");
import { Message, Content } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "gayrate",
      description: "Find out how gay you are.",
      type: "fun",
      usage: "<prefix>gayrate @user",
    });
  }

  async action(message: Message): Promise<Message> {
    let user = message.mentions[0];
    if (!user) {
      user = message.user;
    }

    const hash = crypto
      .createHash("md5")
      .update(user.id.toString())
      .digest("hex");

    const result = hash
      .split("")
      .filter((h) => !isNaN(parseInt(h, 10)))
      .join("");

    const percent = parseInt(result.substr(0, 2), 10) + 1;

    const response =
      user.id === message.user.id
        ? `You are ${percent}% gay 🏳‍🌈`
        : `@${user.username} is ${percent}% gay 🏳‍🌈`;
    const content = new Content().insertText(response);

    return message.reply(content);
  }
}
