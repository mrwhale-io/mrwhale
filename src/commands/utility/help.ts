import { Content, Message } from "@mrwhale-io/gamejolt";
import { TimeUtilities } from "../../util/time";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "help",
      description: "Get command help.",
      type: "utility",
      usage: "<prefix>help <type|cmd>",
      cooldown: 5000,
    });
  }

  async action(message: Message, [typeOrCmdName]: [string]): Promise<void> {
    const content = new Content();
    const types = ["admin", "fun", "game", "utility", "useful"];

    if (typeOrCmdName) {
      const cmd: Command = this.client.commands.find(
        (c) =>
          c.name.toLowerCase() === typeOrCmdName.toLowerCase() ||
          c.aliases.map((alias) => alias.toLowerCase()).includes(typeOrCmdName)
      );

      if (cmd) {
        let response = `Name: ${cmd.name}\nDescription: ${
          cmd.description
        }\nType: ${cmd.type}\nUsage: ${
          cmd.usage
        }\nCooldown: ${TimeUtilities.convertMs(
          cmd.rateLimiter.duration
        ).toString()}`;

        if (cmd.examples.length > 0) {
          response += `\nExamples: ${cmd.examples.join(", ")}`;
        }

        if (cmd.aliases.length > 0) {
          response += `\nAliases: ${cmd.aliases.join(", ")}`;
        }

        response = response.replace(/<prefix>/g, this.client.prefix);

        content.insertCodeBlock(response);
        return message.reply(content);
      }

      if (types.includes(typeOrCmdName.toLowerCase())) {
        const commands = this.client.commands.filter(
          (c: Command) => c.type === typeOrCmdName.toLowerCase()
        );
        const listItemNodes = [];
        for (const command of commands) {
          const contentText = content.textNode(
            `${this.client.prefix}${command.name} - ${command.description}`
          );
          const contentNode = content.paragraphNode(contentText);

          listItemNodes.push(content.listItemNode(contentNode));
        }

        content.insertBulletList(listItemNodes);

        return message.reply(content);
      }

      return message.reply("Could not find this command or type.");
    }

    const listItemNodes = [];
    for (const type of types) {
      const contentText = content.textNode(`${this.client.prefix}help ${type}`);
      const contentNode = content.paragraphNode(contentText);

      listItemNodes.push(content.listItemNode(contentNode));
    }

    content.insertBulletList(listItemNodes);

    return message.reply(content);
  }
}
