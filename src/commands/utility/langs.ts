import * as translate from "translate-google";
import { Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import { unorderedList } from "../../util/markdown-helpers";

export default class extends Command {
  constructor() {
    super({
      name: "langs",
      description: "List supported languages for the translate command.",
      type: "utility",
      usage: "<prefix>langs",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<Message> {
    const languages = [];

    for (const language in translate.languages) {
      languages.push(language);

      if (language === "zu") {
        break;
      }
    }

    return message.reply(unorderedList(languages));
  }
}
