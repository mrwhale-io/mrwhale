import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "friendrequest",
      description: "Sends you a friend request.",
      type: "utility",
      usage: "<prefix>friendrequest",
      aliases: ["fr", "friend"],
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      if (!this.botClient.friendsList.has(message.user.id)) {
        await this.botClient.client.api.friendRequest(message.user.id);
        return message.reply("Friend request successfully sent.");
      } else {
        return message.reply("We're already friends.");
      }
    } catch {
      return message.reply("Could not send friend request.");
    }
  }
}
