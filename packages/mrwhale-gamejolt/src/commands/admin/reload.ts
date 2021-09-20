import { Message } from "@mrwhale-io/gamejolt-client";

import { Command } from "../command";

export default class extends Command {
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
    const command = this.client.commands.find(
      (cmd) => cmd.name === commandName
    );

    if (commandName && !command) {
      return message.reply(`'${commandName}' is not a valid command.`);
    }

    if (command) {
      this.client.reloadCommand(command.name);
    } else {
      this.client.reloadCommand("all");
    }

    const end = process.hrtime(start);

    return message.reply(
      `Command(s) sucessfully reloaded. Time taken: ${end[0]}s ${
        end[1] / 1000000
      }ms`
    );
  }
}
