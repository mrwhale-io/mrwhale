import { choose } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(choose.data);
  }

  async action(message: Message, args: string[]): Promise<Message> {
    return message.reply(choose.action(args));
  }
}
