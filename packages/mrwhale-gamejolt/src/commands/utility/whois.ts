import { InfoBuilder } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { format, formatDistanceToNowStrict, addYears } from "date-fns";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

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
    const user = message.mentions[0] || message.user; // Default to message author if no mention

    if (!user || user.id === undefined) {
      return message.reply("Could not find this user.");
    }

    // Format the join date
    const joinDate = user.created_on || null;
    const formattedDate = joinDate
      ? format(joinDate, "MMM dd, yyyy hh:mm:ss a")
      : "Unknown";

    // Time since they joined
    const joinedAgo = joinDate
      ? formatDistanceToNowStrict(joinDate)
      : "Unknown";

    // Calculate the next account birthday
    let countdown = "Unknown";
    if (joinDate) {
      const now = new Date();
      const thisYearBirthday = new Date(
        now.getFullYear(),
        joinDate.getMonth(),
        joinDate.getDate()
      );
      const nextBirthday =
        thisYearBirthday > now
          ? thisYearBirthday
          : addYears(thisYearBirthday, 1);

      countdown = formatDistanceToNowStrict(nextBirthday, { addSuffix: true });
    }

    // Build the user information
    const info = new InfoBuilder()
      .addField("🆔 Username", user.username || "N/A")
      .addField("📛 Display Name", user.display_name || "N/A")
      .addField("🌐 Website", user.web_site || "No website provided")
      .addField("🔰 Moderator", user.permission_level > 0 ? "Yes ✅" : "No ❌")
      .addField("📅 Joined", `${formattedDate} (${joinedAgo} ago)`)
      .addField("🎂 Next Spawn Day", countdown)
      .addField("👥 Followers", `${user.follower_count || 0}`)
      .addField("🔗 Following", `${user.following_count || 0}`);

    return message.reply(`${info}`);
  }
}
