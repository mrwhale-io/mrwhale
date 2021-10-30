import { Message } from "@mrwhale-io/gamejolt-client";
import { codeBlock } from '@mrwhale-io/core';
import * as WolframAlphaAPI from "wolfram-alpha-api";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import * as config from "../../../config.json";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "wolfram",
      description: "Compute answers using Wolfram alpha.",
      type: "useful",
      usage: "<prefix>wolfram <query>",
      cooldown: 3000,
    });
  }

  async action(message: Message, [query]: [string]): Promise<Message> {
    if (!config.wolfram) {
      return message.reply("No API key provided for wolfram.");
    }

    if (!query) {
      return message.reply("Please provide a query.");
    }

    const waApi = WolframAlphaAPI(config.wolfram);

    try {
      const result = await waApi.getShort(query);

      return message.reply(codeBlock(result));
    } catch {
      return message.reply("Could not fetch result.");
    }
  }
}
