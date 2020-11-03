import crypto = require("crypto");
import { Message, Content } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "ship",
      description: "Find out how compatible two users are.",
      type: "fun",
      usage: "<prefix>ship @user1 @user2",
    });
  }

  async action(message: Message) {
    const firstUser = message.mentions.find(
      (user) => user.id !== message.user.id
    );

    if (!firstUser) {
      return message.reply("You must mention two users.");
    }

    const secondUser =
      message.mentions.find(
        (user) => user.id !== firstUser.id && user.id !== message.user.id
      ) || message.user;

    if (!secondUser) {
      return message.reply("You must mention two users.");
    }

    const users = [firstUser, secondUser].sort((a, b) => a.id - b.id);
    const hash = crypto
      .createHash("md5")
      .update(`${users[0].id}${users[1].id}`)
      .digest("hex");

    const radix = 10;
    const result = hash
      .split("")
      .filter((h) => !isNaN(parseInt(h, radix)))
      .join("");

    const percent = parseInt(result.substr(0, 2), radix);

    const content = new Content();
    const nodes = [
      content.textNode(`💘 There's a ${percent}% match between `),
      content.textNode(firstUser.username, [
        content.mention(firstUser.username),
      ]),
      content.textNode(" and "),
      content.textNode(secondUser.username, [
        content.mention(secondUser.username),
      ]),
      content.textNode(" 💘"),
    ];
    content.insertNewNode(nodes);

    return message.reply(content);
  }
}
