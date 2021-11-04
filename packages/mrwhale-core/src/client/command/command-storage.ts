import { Collection } from "@discordjs/collection";

import { BotClient } from "../bot-client";
import { Command } from "./command";

/**
 * Stores all loaded commands in a collection.
 * 
 * @template T The bot client.
 * @template C The command type.
 */
export class CommandStorage<
  T extends BotClient,
  C extends Command<any>
> extends Collection<string, C> {
  constructor() {
    super();
  }

  /**
   * Add a new loaded command to the collection.
   *
   * @param client The bot client.
   * @param command The command object to register.
   * @param key The key to register command under.
   * @param commandLocation The location of the command.
   * @param reload Whether to reload command.
   */
  register(
    client: T,
    command: C,
    key: string,
    commandLocation: string,
    reload?: boolean
  ): void {
    if (super.has(command.name) && !reload) {
      return;
    }

    for (const cmd of this.values()) {
      for (const alias of cmd.aliases) {
        const duplicates = this.filter(
          (c) => c.aliases.includes(alias) && c !== cmd
        );
        if (duplicates.size > 0) {
          throw new Error(`Command may may not share aliases`);
        }
      }
    }
    command.register(client, commandLocation);
    super.set(key, command);
  }

  /**
   * Finds a command by name or alias.
   *
   * @param text The command name or alias.
   */
  findByNameOrAlias(text: string): C {
    return this.filter(
      (c) => c.name === text || c.aliases.includes(text)
    ).first();
  }

  /**
   * Finds commands by type and returns a collection of found commands.
   *
   * @param text The command type.
   */
  findByType(text: string): Collection<string, C> {
    return this.filter((c) => c.type === text);
  }
}
