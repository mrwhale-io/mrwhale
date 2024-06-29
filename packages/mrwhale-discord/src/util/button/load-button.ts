import { DiscordButton } from "../../client/button/discord-button";

/**
 * Loads a discord button from a given file path.
 * @param classLocation The class location of the discord button.
 */
export function loadButton(classLocation: string): typeof DiscordButton {
  delete require.cache[require.resolve(classLocation)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const buttonModule = require(classLocation);

  let button: typeof DiscordButton;

  if (
    buttonModule &&
    Object.getPrototypeOf(buttonModule).name !== DiscordButton.name
  ) {
    for (const key of Object.keys(buttonModule)) {
      if (
        Object.getPrototypeOf(buttonModule[key]).name === DiscordButton.name
      ) {
        button = buttonModule[key];
        break;
      }
    }
  } else {
    button = buttonModule;
  }

  return button;
}
