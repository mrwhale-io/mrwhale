import { Message } from "@mrwhale-io/gamejolt-client";
import { conchshell } from "@mrwhale-io/commands";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(conchshell.data);
  }

  async action(message: Message, [question]: [string]): Promise<Message> {
    return message.reply(conchshell.action(question));
  }
}
