import { Command } from "../client/command";

/**
 * Loads a command object.
 * 
 * @param classLocation The class location.
 * @param className The name of the class.
 */
export function loadCommand(classLocation: string, className: string): any {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cmdModule = require(classLocation);

  let command: typeof Command;

  if (cmdModule && Object.getPrototypeOf(cmdModule).name !== className) {
    for (const key of Object.keys(cmdModule)) {
      if (Object.getPrototypeOf(cmdModule[key]).name === className) {
        command = cmdModule[key];
        break;
      }
    }
  } else {
    command = cmdModule;
  }
  return command;
}
