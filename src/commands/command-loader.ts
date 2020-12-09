import * as glob from "glob";
import * as path from "path";

import { Command } from "./command";
import { BotClient } from "../bot-client";

/**
 * Responsible for loading and registering commands.
 */
export class CommandLoader {
  /**
   * Count of the loaded commands.
   */
  loadedCommands: number;

  readonly client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
    this.loadedCommands = 0;
  }

  /**
   * Loads all commands from the commands directory.
   */
  loadCommands(): void {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadedCommand: any = this.loadCommand(commandLocation);
      const command: Command = new loadedCommand();

      command.register(this.client, commandLocation);

      this.loadedCommands++;
    }
  }

  /**
   * Reloads a command.
   * @param commandName The name of the command to reload.
   */
  reloadCommand(commandName: string): boolean {
    const cmdIndex = this.client.commands.findIndex(
      (cmd) => cmd.name === commandName
    );

    if (cmdIndex === -1) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
