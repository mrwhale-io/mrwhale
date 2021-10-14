import * as translate from "translate-google";
import { truncate } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "translate",
      description:
        "Translate to specified language. Use langs command for supported languages.",
      type: "useful",
      usage: "<prefix>translate <lang>, <text>",
      examples: ["<prefix>translate es, Hello", "<prefix>translate auto, Hola"],
      cooldown: 3000,
    });
  }

  async action(
    message: Message,
    [lang, ...text]: [string, string[]]
  ): Promise<Message> {
    const toTranslate = text.join();

    if (!toTranslate) {
      return message.reply("Please pass some text to translate.");
    }

    translate(toTranslate, { to: lang || "en" })
      .then((response) => {
        const max = 980;

        return message.reply(truncate(max, response));
      })
      .catch(() => {
        return message.reply(
          "Couldn't find specified language. Use lang command for available languages."
        );
      });
  }
}
