import { calculate } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(calculate.data);
  }

  async action(message: Message, [expression]: [string]): Promise<Message> {
    return message.reply(calculate.action(expression));
  }
}
