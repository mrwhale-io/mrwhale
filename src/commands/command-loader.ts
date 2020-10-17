import * as glob from "glob";
import * as path from "path";

import { Command } from "./command";
import { BotClient } from "../bot-client";

export class CommandLoader {
  loadedCommands: number;

  readonly client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
    this.loadedCommands = 0;
  }

  loadCommands() {
    if (this.client.commands.length > 0) {
      this.client.commands = [];
      this.loadedCommands = 0;
    }

    const files: string[] = [];
    const directories = ["fun", "game", "info", "useful"];

    for (const directory of directories) {
      files.push(
        ...glob.sync(`${path.join(__dirname, `./${directory}`)}/*.ts`)
      );
    }

    for (const file of files) {
      const commandLocation = file.replace(".ts", "");
      const loadedCommand: any = this.loadCommand(commandLocation);
      const command: Command = new loadedCommand();

      command.register(this.client, commandLocation);

      this.client.commands.push(command);
      this.loadedCommands++;
    }
  }

  private loadCommand(classLocation: string) {
    const cmdModule = require(classLocation);

    let command: typeof Command;

    if (cmdModule && Object.getPrototypeOf(cmdModule).name !== "Command") {
      for (const key of Object.keys(cmdModule)) {
        if (Object.getPrototypeOf(cmdModule[key]).name === "Command") {
          command = cmdModule[key];
          break;
        }
      }
    } else {
      command = cmdModule;
    }
    return command;
  }
}
