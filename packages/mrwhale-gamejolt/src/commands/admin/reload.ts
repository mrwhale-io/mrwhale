import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "reload",
      description: "Reload a command.",
      type: "admin",
      usage: "<prefix>reload <command>",
      admin: true,
    });
  }

  async action(message: Message, [commandName]: [string]): Promise<Message> {
    const start = process.hrtime();
    const command = this.botClient.commands.findByNameOrAlias(commandName);

    if (commandName && !command) {
      return message.reply(`'${commandName}' is not a valid command.`);
    }

    command
      ? this.botClient.reloadCommand(command.name)
      : this.botClient.reloadCommand("all");

    const end = process.hrtime(start);

    return message.reply(
      `Command(s) sucessfully reloaded. Time taken: ${end[0]}s ${
        end[1] / 1000000
      }ms`
    );
  }
}
