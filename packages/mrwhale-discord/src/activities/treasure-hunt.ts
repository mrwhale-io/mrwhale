import { ActivityHandler } from "../client/activity/activity-handler";
import { Activity } from "../types/activities/activity";
import { Activities } from "../types/activities/activities";

export default class extends ActivityHandler {
  constructor() {
    super({
      name: Activities.TreasureHunt,
    });
  }

  async action(activity: Activity): Promise<void> {
    return await this.botClient.treasureHuntManager.startTreasureHunt(activity);
  }
}
