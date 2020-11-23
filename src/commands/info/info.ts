import { Message, Content } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { TimeUtilities } from "../../util/time";

export default class extends Command {
  constructor() {
    super({
      name: "info",
      description: "Get bot information.",
      type: "info",
      usage: "<prefix>info",
      aliases: ["uptime", "stats"],
    });
  }

  async action(message: Message) {
    const content = new Content();
    const fractionalDigits = 2;
    const memUnit = 1024;
    const memoryUsage = process.memoryUsage().heapUsed / memUnit / memUnit;
    const uptime = TimeUtilities.convertMs(this.client.uptime).toString();

    content.insertCodeBlock(
      `Group chats: ${this.client.chat.groupChats.length}\nFriends: ${
        this.client.chat.friendsList.collection.length
      }\nMemory usage: ${memoryUsage.toFixed(
        fractionalDigits
      )} MB\nUptime: ${uptime}`
    );

    return message.reply(content);
  }
}
