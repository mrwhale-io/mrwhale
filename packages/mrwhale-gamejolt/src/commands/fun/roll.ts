import { roll } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(roll.data);
  }

  async action(message: Message, args: string[]): Promise<Message> {
    return message.reply(roll.action(args));
  }
}
