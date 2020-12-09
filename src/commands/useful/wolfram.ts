import { Content, Message } from "@mrwhale-io/gamejolt";
import * as WolframAlphaAPI from "wolfram-alpha-api";

import { Command } from "../command";
import * as config from "../../../config.json";

export default class extends Command {
  constructor() {
    super({
      name: "wolfram",
      description: "Compute answers using Wolfram alpha.",
      type: "useful",
      usage: "<prefix>wolfram <query>",
    });
  }

  async action(message: Message, [query]: [string]): Promise<void> {
    if (!config.wolfram) {
      return message.reply("No API key provided for wolfram.");
    }

    if (!query) {
      return message.reply("Please provide a query.");
    }

    const waApi = WolframAlphaAPI(config.wolfram);
    const content = new Content();

    try {
      const result = await waApi.getShort(query);
      content.insertCodeBlock(result);

      return message.reply(content);
    } catch {
      return message.reply("Could not fetch result.");
    }
  }
}
