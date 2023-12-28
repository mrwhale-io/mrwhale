import { DiscordSelectMenu } from "../client/menu/discord-select-menu";

/**
 * Loads a discord select menu from a given file path.
 * @param classLocation The class location of the discord select menu.
 */
export function loadSelectMenu(
  classLocation: string
): typeof DiscordSelectMenu {
  delete require.cache[require.resolve(classLocation)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const selectMenuModule = require(classLocation);

  let selectMenu: typeof DiscordSelectMenu;

  if (
    selectMenuModule &&
    Object.getPrototypeOf(selectMenuModule).name !== DiscordSelectMenu.name
  ) {
    for (const key of Object.keys(selectMenuModule)) {
      if (
        Object.getPrototypeOf(selectMenuModule[key]).name ===
        DiscordSelectMenu.name
      ) {
        selectMenu = selectMenuModule[key];
        break;
      }
    }
  } else {
    selectMenu = selectMenuModule;
  }
  return selectMenu;
}
