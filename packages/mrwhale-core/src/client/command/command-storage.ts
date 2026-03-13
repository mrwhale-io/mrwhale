import { Collection } from "@discordjs/collection";

import { BotClient } from "../bot-client";
import { Command } from "./command";

/**
 * A collection-based storage system for managing bot commands.
 *
 * Extends the base Collection class to provide specialized functionality for
 * storing, registering, and retrieving bot commands. Includes validation to
 * prevent duplicate aliases and provides lookup methods by name, alias, and type.
 *
 * @template T - The bot client type that extends BotClient
 * @template C - The command type that extends Command
 *
 * @example
 * ```typescript
 * const commandStorage = new CommandStorage<MyBotClient, MyCommand>();
 * commandStorage.register(client, defineCommand, 'define', './commands/define.ts');
 *
 * const command = commandStorage.findByNameOrAlias('define');
 * const funCommands = commandStorage.findByType('fun');
 * ```
 */
export class CommandStorage<
  T extends BotClient,
  C extends Command<any>,
> extends Collection<string, C> {
  constructor() {
    super();
  }

  /**
   * Registers a command with the command storage system.
   *
   * @param client - The client instance to register the command with
   * @param command - The command instance to register
   * @param key - The unique key to store the command under
   * @param commandLocation - The file path or location where the command is defined
   * @param reload - Optional flag to allow reregistering an existing command (defaults to false)
   *
   * @throws {Error} Throws an error if commands share aliases, which is not allowed
   *
   * @remarks
   * - If a command with the same name already exists and reload is false, the method returns early
   * - Validates that no two commands share the same aliases before registration
   * - Calls the command's own register method with the client and location
   * - Stores the command in the parent Map using the provided key
   */
  register(
    client: T,
    command: C,
    key: string,
    commandLocation: string,
    reload?: boolean,
  ): void {
    // If a command with the same name already exists and reload is not allowed, return early
    if (super.has(command.name) && !reload) {
      return;
    }

    // Validate that no two commands share the same aliases before registration
    for (const cmd of this.values()) {
      for (const alias of cmd.aliases) {
        const duplicates = this.findDuplicateCommands(alias, cmd);
        if (duplicates.size > 0) {
          throw new Error(
            `Commands "${cmd.name}" and "${
              duplicates.first().name
            }" share the same alias "${alias}", which is not allowed.`,
          );
        }
      }
    }

    command.register(client, commandLocation);
    super.set(key, command);
  }

  /**
   * Finds a command by its name or any of its aliases.
   *
   * @param text - The name or alias to search for
   * @returns The first command that matches the given name or alias, or undefined if no match is found
   */
  findByNameOrAlias(text: string): C {
    return this.filter(
      (c) => c.name === text || c.aliases.includes(text),
    ).first();
  }

  /**
   * Filters commands by their type and returns a collection of matching commands.
   *
   * @param type - The type of commands to filter by
   * @returns A collection containing all commands that match the specified type
   */
  findByType(type: string): Collection<string, C> {
    return this.filter((c) => c.type === type);
  }

  /**
   * Finds a command by its name.
   *
   * @param name - The name of the command to search for
   * @returns The first command that matches the given name, or undefined if no match is found
   */
  findByName(name: string): C {
    return this.filter((c) => c.name === name).first();
  }

  /**
   * Finds a command by one of its aliases.
   *
   * @param alias - The alias of the command to search for
   * @returns The first command that matches the given alias, or undefined if no match is found
   */
  findByAlias(alias: string): C {
    return this.filter((c) => c.aliases.includes(alias)).first();
  }

  /**
   * Finds duplicate commands based on a given alias.
   *
   * @param alias - The alias to check for duplicates
   * @param cmd - The command to exclude from the duplicate check
   * @returns A collection of commands that share the same alias, excluding the specified command
   */
  private findDuplicateCommands(alias: string, cmd: C) {
    return this.filter((c) => c.aliases.includes(alias) && c !== cmd);
  }
}
