import { ActivityHandler } from "../client/activity/activity-handler";
import { Activity } from "../types/activities/activity";
import { Activities } from "../types/activities/activities";

export default class extends ActivityHandler {
  constructor() {
    super({
      name: Activities.FishSpawn,
    });
  }

  async action(activity: Activity): Promise<void> {
    const { guildId } = activity;

    await this.botClient.fishSpawner.spawnFishInGuild(guildId);
  }

  async endAction(activity: Activity): Promise<void> {
    const { guildId } = activity;

    await this.botClient.fishSpawner.despawnFishInGuild(guildId);
  }
}
