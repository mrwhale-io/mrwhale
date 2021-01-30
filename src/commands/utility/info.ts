import { Message, Content } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { TimeUtilities } from "../../util/time";
import { version } from "../../../package.json";

export default class extends Command {
  constructor() {
    super({
      name: "info",
      description: "Get bot information.",
      type: "utility",
      usage: "<prefix>info",
      aliases: ["uptime", "stats", "version"],
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<void> {
    const content = new Content();
    const fractionalDigits = 2;
    const memUnit = 1024;
    const memoryUsage = process.memoryUsage().heapUsed / memUnit / memUnit;
    const uptime = TimeUtilities.convertMs(this.client.uptime).toString();
    const cleverbot = this.client.cleverbot ? "on" : "off";

    content.insertCodeBlock(
      `Version: ${version}\nGroup chats: ${
        this.client.chat.groupIds.length
      }\nFriends: ${
        this.client.chat.friendsList.collection.length
      }\nMemory usage: ${memoryUsage.toFixed(
        fractionalDigits
      )} MB\nUptime: ${uptime}\nCleverbot: ${cleverbot}`
    );

    return message.reply(content);
  }
}
