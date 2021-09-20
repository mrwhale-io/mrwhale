import { Message } from "@mrwhale-io/gamejolt-client";
import * as WolframAlphaAPI from "wolfram-alpha-api";

import { Command } from "../command";
import * as config from "../../../config.json";
import { codeBlock } from "../../util/markdown-helpers";

export default class extends Command {
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
