import { InfoBuilder } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { format, formatDistanceToNowStrict } from "date-fns";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "whois",
      description: "Get information about a user.",
      type: "utility",
      usage: "<prefix>whois @user",
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<Message> {
    if (message.mentions.length === 0) {
      return message.reply("You must mention a user.");
    }

    const user = message.mentions[0];

    if (user && user.id !== undefined) {
      const formattedDate = format(user.created_on, "MMM dd, yyyy hh:mm:ss a");
      const info = new InfoBuilder()
        .addField("Username", user.username)
        .addField("Display Name", user.display_name)
        .addField("Website", user.web_site)
        .addField("Moderator", user.permission_level > 0 ? "Yes" : "No")
        .addField("Follower Count", `${user.follower_count}`)
        .addField("Following Count", `${user.following_count}`)
        .addField(
          "Joined",
          `${formattedDate} (${formatDistanceToNowStrict(user.created_on)})`
        );

      return message.reply(`${info}`);
    }

    return message.reply("Could not find this user.");
  }
}
