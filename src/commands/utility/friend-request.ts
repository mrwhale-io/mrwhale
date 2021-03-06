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

      if (!this.client.chat.friendsList.has(user.id)) {
        await this.client.api.friendRequest(user.id);
        return message.reply("Friend request successfully sent.");
      } else {
        return message.reply("Already friends with this user.");
      }
    } catch {
      return message.reply("Could not send friend request.");
    }
  }
}
