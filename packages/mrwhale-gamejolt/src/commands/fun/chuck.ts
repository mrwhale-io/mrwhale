import { chuck } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(chuck.data);
  }

  async action(
    message: Message,
    [firstName, lastName, category]: [string, string, string]
  ): Promise<Message> {
    return message.reply(await chuck.action(firstName, lastName, category));
  }
}
