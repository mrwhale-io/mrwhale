import { TimeUtilities, InfoBuilder } from '@mrwhale-io/core';
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { version } from "../../../package.json";

const FRACTIONAL_DIGITS = 2;
const MEM_UNIT = 1024;

export default class extends GameJoltCommand {
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

  async action(message: Message): Promise<Message> {
    const memoryUsage = process.memoryUsage().heapUsed / MEM_UNIT / MEM_UNIT;
    const groupIds =
      this.botClient.client.chat.groupIds ||
      this.botClient.client.chat.groups.map((group) => group.id);
    const response = new InfoBuilder()
      .addField("Version", version)
      .addField("Group chats", `${groupIds.length}`)
      .addField(
        "Friends",
        `${this.botClient.client.chat.friendsList.collection.length}`
      )
      .addField("Loaded commands", `${this.botClient.commands.size}`)
      .addField("Memory usage", `${memoryUsage.toFixed(FRACTIONAL_DIGITS)}`)
      .addField("Uptime", `${TimeUtilities.convertMs(this.botClient.uptime)}`)
      .addField("Cleverbot", this.botClient.cleverbot ? "on" : "off")
      .build();

    return message.reply(response);
  }
}
