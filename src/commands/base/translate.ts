import * as translate from "translate-google";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { truncate } from "../../util/truncate";

export default class extends Command {
  constructor() {
    super({
      name: "translate",
      description:
        "Translate to specified language. Use langs command for supported languages.",
      usage: "<prefix>translate <lang>, <text>",
    });
  }

  async action(message: Message, [lang, ...text]: [string, string[]]) {
    const toTranslate = text.join();
    const content = new Content();

    if (!toTranslate) {
      content.insertText("Please pass some text to translate.");

      return message.reply(content);
    }

    translate(toTranslate, { to: lang || "en" })
      .then((response) => {
        const max = 980;
        content.insertText(truncate(max, response));

        return message.reply(content);
      })
      .catch((err) => {
        content.insertText(
          "Couldn't find specified language. Use lang command for available languages."
        );

        return message.reply(content);
      });
  }
}
