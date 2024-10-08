import { Activities } from "../types/activities/activities";
import { ActivityHandler } from "../client/activity/activity-handler";
import { Activity } from "../types/activities/activity";

export default class extends ActivityHandler {
  constructor() {
    super({
      name: Activities.HungerAnnouncement,
    });
  }

  async action(activity: Activity): Promise<void> {
    this.botClient.hungerManager.sendHungryAnnouncement(activity.guildId);
  }
}
