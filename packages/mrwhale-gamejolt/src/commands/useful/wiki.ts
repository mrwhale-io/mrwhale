import { wiki } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(wiki.data);
  }

  async action(message: Message, [query]: [string]): Promise<Message> {
    return message.reply(await wiki.action(query));
  }
}
