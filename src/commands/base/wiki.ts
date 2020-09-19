import wiki from "wikijs";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { truncate } from "../../util/truncate";

export default class extends Command {
  constructor() {
    super({
      name: "wiki",
      description: "Search for a Wiki page.",
      usage: "<prefix>wiki <query>",
    });
  }

  async action(message: Message, [query]: [string]) {
    const content = new Content();

    if (!query) {
      content.insertText("Please provide a search.");

      return message.reply(content);
    }

    wiki()
      .search(query.trim(), 1)
      .then((data) => {
        wiki()
          .page(data.results[0])
          .then((page) => {
            page.summary().then((info) => {
              const max = 980;
              content.insertText(truncate(max, info));

              return message.reply(content);
            });
          });
      })
      .catch(() => {
        content.insertText("I couldn't search for this wiki.");

        return message.reply(content);
      });
  }
}
