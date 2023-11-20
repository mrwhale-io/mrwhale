import { truncate } from "@mrwhale-io/core";
import { wiki } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { MAX_MESSAGE_LENGTH } from "../../constants";

export default class extends GameJoltCommand {
  constructor() {
    super(wiki.data);
  }

  async action(message: Message, [query]: [string]): Promise<Message> {
    return message.reply(
      truncate(MAX_MESSAGE_LENGTH - 3, await wiki.action(query))
    );
  }
}
