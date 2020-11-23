import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "help",
      description: "Get command help.",
      type: "utility",
      usage: "<prefix>help <type|cmd>",
    });
  }

  async action(message: Message, [typeOrCmdName]: [string]) {
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
        }\nType: ${cmd.type}\nUsage: ${cmd.usage.replace(
          /<prefix>/g,
          this.client.prefix
        )}`;

        if (cmd.aliases.length > 0) {
          response += `\nAliases: ${cmd.aliases.join()}`;
        }

        content.insertCodeBlock(response);
        return message.reply(content);
      }

      if (types.includes(typeOrCmdName.toLowerCase())) {
        const commands = this.client.commands.filter(
          (c: Command) => c.type === typeOrCmdName.toLowerCase()
        );
        let listItemNodes = [];
        for (let command of commands) {
          const contentText = content.textNode(
            `${command.name} - ${command.description}`
          );
          const contentNode = content.paragraphNode(contentText);

          listItemNodes.push(content.listItemNode(contentNode));
        }

        content.insertBulletList(listItemNodes);

        return message.reply(content);
      }

      return message.reply("Could not find this command or type.");
    }

    let listItemNodes = [];
    for (let type of types) {
      const contentText = content.textNode(`${this.client.prefix}help ${type}`);
      const contentNode = content.paragraphNode(contentText);

      listItemNodes.push(content.listItemNode(contentNode));
    }

    content.insertBulletList(listItemNodes);

    return message.reply(content);
  }
}
