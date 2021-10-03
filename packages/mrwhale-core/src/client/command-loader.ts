/**
 * Interface for command loaders to implement.
 */
export interface CommandLoader {
  /**
   * Count of the loaded commands.
   */
  loadedCommands: number;

  /**
   * Loads all bot commands.
   */
  loadCommands(): void;

  /**
   * Reloads a command.
   *
   * @param commandName The name of the command to reload.
   */
  reloadCommand(commandName: string): boolean;
}
