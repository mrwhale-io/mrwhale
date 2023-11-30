import { GuildSettings } from "@mrwhale-io/core";
import { Guild } from "./guild";

export interface GuildManage {
  guild: Guild;
  settings: GuildSettings;
}
