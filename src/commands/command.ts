import { Message } from "@mrwhale-io/gamejolt";

import { CommandOptions } from "../types/command-options";
import { BotClient } from "../bot-client";
import { CommandTypes } from "../types/command-types";

export abstract class Command {
  name: string;
  description: string;
  type: CommandTypes;
  usage: string;
  argSeparator: string;
  commandLocation: string;
  groupOnly: boolean;
  ownerOnly: boolean;

  client: BotClient;

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.type = options.type;
    this.usage = options.usage;
    this.argSeparator = options.argSeparator || ",";
    this.groupOnly = options.groupOnly || false;
    this.ownerOnly = options.ownerOnly || false;
  }

  /**
   * The action this command performs.
   * @param message The message that invoked this command.
   * @param [args] Any arguments passed with this command.
   */
  abstract action(message: Message, args?: any[]): Promise<any>;

  /**
   * Register this as an available command.
   * @param client The bot client to register command on.
   * @param commandLocation The path location of this command.
   */
  register(client: BotClient, commandLocation: string) {
    this.client = client;
    this.commandLocation = commandLocation;

    if (!this.name) {
      throw new Error(`Command must have a name`);
    }

    if (!this.description) {
      throw new Error(`Command must have a description`);
    }

    if (!this.type) {
      throw new Error(`Command must have a type`);
    }
  }
}
