import { wolfram } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import * as config from "../../../config.json";

export default class extends GameJoltCommand {
  constructor() {
    super(wolfram.data);
  }

  async action(message: Message, [query]: [string]): Promise<Message> {
    return message.reply(await wolfram.action(query, config.wolfram));
  }
}
