import { Command } from "../client/command/command";

/**
 * Loads a command object.
 *
 * @param classLocation The class location.
 * @param commandType The type of the class to load.
 */
export function loadCommand(
  classLocation: string,
  commandType: string
): typeof Command {
  delete require.cache[require.resolve(classLocation)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cmdModule = require(classLocation);

  let command: typeof Command;

  if (cmdModule && Object.getPrototypeOf(cmdModule).name !== commandType) {
    for (const key of Object.keys(cmdModule)) {
      if (Object.getPrototypeOf(cmdModule[key]).name === commandType) {
        command = cmdModule[key];
        break;
      }
    }
  } else {
    command = cmdModule;
  }
  return command;
}
