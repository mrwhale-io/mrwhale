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
    await this.botClient.fishSpawner.spawnFishInGuild(activity);
  }

  async endAction(activity: Activity): Promise<void> {
    if (this.botClient.fishSpawner.hasGuildFish(activity.guildId)) {
      await this.botClient.fishSpawner.despawnFishInGuild(activity.guildId);
    }
  }
}
