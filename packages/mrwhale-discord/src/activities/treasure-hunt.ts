import { Activities } from "../types/activities/activities";
import { ActivityHandler } from "../client/activity/activity-handler";
import { Activity } from "../types/activities/activity";

export default class extends ActivityHandler {
  constructor() {
    super({
      name: Activities.TreasureHunt,
    });
  }

  async action(activity: Activity): Promise<void> {
    console.log("Treasure hunt started!", activity);
  }

  async endAction(activity: Activity): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
}
