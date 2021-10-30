import { ship } from "@mrwhale-io/commands";
import { Content, Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super(ship.data);
  }

  async action(
    message: Message,
    [firstUser, secondUser]: [string, string]
  ): Promise<Message> {
    const result = ship.action(firstUser, secondUser);
    const content = new Content().insertText(result);

    return message.reply(content);
  }
}
