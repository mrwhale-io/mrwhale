import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { conchshell } from "@mrwhale-io/commands";

export default class extends GameJoltCommand {
  constructor() {
    super(conchshell.data);
  }

  async action(message: Message, [question]: [string]): Promise<Message> {
    return message.reply(conchshell.action(question));
  }
}
