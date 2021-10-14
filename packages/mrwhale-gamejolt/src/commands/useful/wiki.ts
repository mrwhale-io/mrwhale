import wiki from "wikijs";
import { truncate } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "wiki",
      description: "Search for a Wiki page.",
      type: "useful",
      usage: "<prefix>wiki <query>",
      examples: ["<prefix>wiki whale"],
      cooldown: 3000,
    });
  }

  async action(message: Message, [query]: [string]): Promise<Message> {
    if (!query) {
      return message.reply("Please provide a search.");
    }

    wiki()
      .search(query.trim(), 1)
      .then((data) => {
        wiki()
          .page(data.results[0])
          .then((page) => {
            page.summary().then((info) => {
              const max = 980;
              return message.reply(truncate(max, info));
            });
          });
      })
      .catch(() => {
        return message.reply("I couldn't search for this wiki.");
      });
  }
}
