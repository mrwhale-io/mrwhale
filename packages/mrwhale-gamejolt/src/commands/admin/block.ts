import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "block",
      description: "Block a user.",
      type: "admin",
      usage: "<prefix>block @user",
      admin: true,
    });
  }

  async action(message: Message): Promise<Message> {
    if (message.mentions.length === 0) {
      return message.reply("You must mention a user.");
    }

    const user = message.mentions[0];

    try {
      await this.botClient.client.api.blockUser(user);

      return message.reply("Successfully blocked user.");
    } catch (error) {
      return message.reply(error.toString());
    }
  }
}
