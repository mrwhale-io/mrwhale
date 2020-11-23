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
    const directories = ["admin", "fun", "game", "utility", "useful"];

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

  reloadCommand(commandName: string) {
    const cmdIndex = this.client.commands.findIndex(
      (cmd) => cmd.name === commandName
    );

    if (cmdIndex === -1) {
      return false;
    }

    const loadedCommandType: any = this.loadCommand(
      this.client.commands[cmdIndex].commandLocation
    );
    const loadedCommand: Command = new loadedCommandType();
    this.client.commands[cmdIndex].register(
      this.client,
      loadedCommand.commandLocation
    );
    this.client.commands[cmdIndex] = loadedCommand;

    return true;
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
