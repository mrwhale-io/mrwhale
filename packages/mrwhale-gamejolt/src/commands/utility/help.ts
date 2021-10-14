import { TimeUtilities } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { unorderedList } from "../../util/markdown-helpers";
import { InfoBuilder } from "../../util/info-builder";

export default class extends GameJoltCommand {
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
    const types = [
      "admin",
      "fun",
      "game",
      "utility",
      "useful",
      "image",
      "level",
    ];

    if (typeOrCmdName) {
      const cmd = this.botClient.commands.findByNameOrAlias(typeOrCmdName);

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
          `${info
            .build()
            .replace(/<prefix>/g, this.botClient.getPrefix(message.room_id))}`
        );
      }

      if (types.includes(typeOrCmdName.toLowerCase())) {
        const commands = this.botClient.commands.findByType(typeOrCmdName);

        return message.reply(
          unorderedList(
            commands.map(
              (command) =>
                `${this.botClient.getPrefix(message.room_id)}${
                  command.name
                } - ${command.description}`
            )
          )
        );
      }

      return message.reply("Could not find this command or type.");
    }

    return message.reply(
      unorderedList(
        types.map(
          (type) => `${this.botClient.getPrefix(message.room_id)}help ${type}`
        )
      )
    );
  }
}
