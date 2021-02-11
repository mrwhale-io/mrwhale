import { Message } from "@mrwhale-io/gamejolt";
import { TimeUtilities } from "../../util/time";

import { Command } from "../command";
import { unorderedList } from "../../util/markdown-helpers";
import { InfoBuilder } from "../../util/info-builder";

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

  async action(message: Message, [typeOrCmdName]: [string]): Promise<Message> {
    const types = ["admin", "fun", "game", "utility", "useful"];

    if (typeOrCmdName) {
      const cmd: Command = this.client.commands.find(
        (c) =>
          c.name.toLowerCase() === typeOrCmdName.toLowerCase() ||
          c.aliases.map((alias) => alias.toLowerCase()).includes(typeOrCmdName)
      );

      if (cmd) {
        const info = new InfoBuilder()
          .addField("Name", cmd.name)
          .addField("Description", cmd.description)
          .addField("Type", cmd.type)
          .addField(
            "Cooldown",
            `${TimeUtilities.convertMs(cmd.rateLimiter.duration)}`
          );

        if (cmd.examples.length > 0) {
          info.addField("Examples", `${cmd.examples.join(", ")}`);
        }

        if (cmd.aliases.length > 0) {
          info.addField("Aliases", `${cmd.aliases.join(", ")}`);
        }

        return message.reply(
          `${info.build().replace(/<prefix>/g, this.client.prefix)}`
        );
      }

      if (types.includes(typeOrCmdName.toLowerCase())) {
        const commands = this.client.commands.filter(
          (c: Command) => c.type === typeOrCmdName.toLowerCase()
        );

        return message.reply(
          unorderedList(
            commands.map(
              (command) =>
                `${this.client.prefix}${command.name} - ${command.description}`
            )
          )
        );
      }

      return message.reply("Could not find this command or type.");
    }

    return message.reply(
      unorderedList(types.map((type) => `${this.client.prefix}help ${type}`))
    );
  }
}
