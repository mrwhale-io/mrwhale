import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "whois",
      description: "Get information about a user.",
      type: "utility",
      usage: "<prefix>whois @user",
    });
  }

  async action(message: Message) {
    if (message.mentions.length === 0) {
      return message.reply("You must mention a user.");
    }

    const content = new Content();
    const user = message.mentions[0];

    if (user && user.id !== undefined) {
      let response = `Username: ${user.display_name}\nDisplay Name: ${
        user.display_name
      }\nWebsite: ${user.web_site}\nDogtag: ${user.dogtag}\nModerator: ${
        user.permission_level > 0 ? "Yes" : "No"
      }\nFollower Count: ${user.follower_count}\nFollowing Count: ${
        user.following_count
      }\nJoined: ${user.created_on}`;

      content.insertCodeBlock(response);

      return message.reply(content);
    }

    return message.reply("Could not find this user.");
  }
}
