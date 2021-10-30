import { define } from "@mrwhale-io/commands";
import { Content, Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(define.data);
  }

  async action(message: Message, [phrase]: [string]): Promise<Message> {
    const content = new Content().insertText(await define.action(phrase));
    return message.reply(content);
  }
}
