import { Message } from "@mrwhale-io/gamejolt-client";

import { Command } from "../command";
import { TimeUtilities } from "../../util/time";
import { version } from "../../../package.json";
import { InfoBuilder } from "../../util/info-builder";

const FRACTIONAL_DIGITS = 2;
const MEM_UNIT = 1024;

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

  async action(message: Message): Promise<Message> {
    const memoryUsage = process.memoryUsage().heapUsed / MEM_UNIT / MEM_UNIT;
    const groupIds =
      this.client.chat.groupIds ||
      this.client.chat.groups.map((group) => group.id);
    const response = new InfoBuilder()
      .addField("Version", version)
      .addField("Group chats", `${groupIds.length}`)
      .addField("Friends", `${this.client.chat.friendsList.collection.length}`)
      .addField("Loaded commands", `${this.client.commands.length}`)
      .addField("Memory usage", `${memoryUsage.toFixed(FRACTIONAL_DIGITS)}`)
      .addField("Uptime", `${TimeUtilities.convertMs(this.client.uptime)}`)
      .addField("Cleverbot", this.client.cleverbot ? "on" : "off")
      .build();

    return message.reply(response);
  }
}
