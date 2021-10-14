import { Command } from '../client/command/command';

/**
 * Get the command name from a given string.
 * 
 * @param text The text containing the command.
 * @param prefix The bot prefix.
 */
export function getCommandName(text: string, prefix: string): string {
  return text.trim().slice(prefix.length).trim().split(" ")[0];
}

/**
 * Get the command arguments from a given string.
 * 
 * @param text The text containing the command.
 * @param prefix The bot prefix.
 * @param argSeparator The argument separator.
 */
export function getCommandArgs(
  text: string,
  prefix: string,
  argSeparator: string
): string[] {
  return text
    .replace(prefix, "")
    .replace(getCommandName(text, prefix), "")
    .trim()
    .split(argSeparator)
    .map((arg) => arg.trim())
    .filter((arg) => arg !== "");
}

/**
 * Dispatch a given command action.
 * 
 * @param command The command to dispatch.
 * @param message The message to pass to the command.
 * @param [args] The arguments to pass to the command.
 */
export function dispatch(
  command: Command<any>,
  message: unknown,
  args?: string[]
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    try {
      const action = command.action(message, args);
      if (action instanceof Promise) {
        action.then(resolve).catch(reject);
      } else resolve(action);
    } catch (err) {
      reject(err);
    }
  });
}
