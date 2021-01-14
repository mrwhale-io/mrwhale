import * as translate from "translate-google";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

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

  async action(message: Message): Promise<void> {
    const content = new Content();
    const listItemNodes = [];
    const languages = translate.languages;

    for (const language in languages) {
      const contentText = content.textNode(language);
      const contentNode = content.paragraphNode(contentText);

      listItemNodes.push(content.listItemNode(contentNode));

      if (language === "zu") {
        break;
      }
    }

    content.insertBulletList(listItemNodes);

    return message.reply(content);
  }
}
