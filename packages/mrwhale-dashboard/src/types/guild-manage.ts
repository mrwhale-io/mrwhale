import { Guild } from "./guild";
import { GuildSettings } from "./guild-settings";

export interface GuildManage {
  guild: Guild;
  settings: GuildSettings;
}
