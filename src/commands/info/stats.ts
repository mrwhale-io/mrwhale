import { Message, Content } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "stats",
      description: "Get bot statistics.",
      type: "info",
      usage: "<prefix>stats",
    });
  }

  async action(message: Message) {
    const content = new Content();
    const fractionalDigits = 2;
    const memUnit = 1024;
    const memoryUsage = process.memoryUsage().heapUsed / memUnit / memUnit;

    content.insertCodeBlock(
      `Group chats: ${this.client.chat.groupChats.length}\nFriends: ${
        this.client.chat.friendsList.collection.length
      }\nMemory usage: ${memoryUsage.toFixed(fractionalDigits)} MB`
    );

    return message.reply(content);
  }
}
