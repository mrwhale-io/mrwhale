import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "unblock",
      description: "Unblock a user.",
      type: "admin",
      usage: "<prefix>unblock @user",
      admin: true,
    });
  }

  async action(message: Message): Promise<Message> {
    if (message.mentions.length === 0) {
      return message.reply("You must mention a user.");
    }

    const user = message.mentions[0];

    try {
      const block = message.client.blockedUsers.find(
        (b) => b.user.id === user.id
      );

      if (!block) {
        return message.reply("No block on this user found.");
      }

      await this.botClient.client.api.unblockUser(block.id);

      return message.reply("Successfully unblocked user.");
    } catch (error) {
      return message.reply(error.toString());
    }
  }
}
