import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "friendrequest",
      description: "Sends a friend request to the specified user.",
      type: "utility",
      usage: "<prefix>friendrequest @user",
      aliases: ["fr", "friend"],
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      let user = message.mentions[0];
      if (!user) {
        user = message.user;
      }

      await this.client.api.friendRequest(user.id);

      return message.reply("Friend request successfully sent.");
    } catch (error) {
      return message.reply(error.message);
    }
  }
}
