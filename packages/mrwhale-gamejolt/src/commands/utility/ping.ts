import { ping } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(ping.data);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(ping.action());
  }
}
