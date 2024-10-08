import { Activity } from "../../types/activities/activity";
import { Activities } from "../../types/activities/activities";
import { ActivityHandlerOptions } from "../../types/activities/activity-handler-options";
import { Loadable } from "../../types/loadable";

/**
 * Represents an abstract class for a bot activity handler.
 */
export abstract class ActivityHandler extends Loadable<Activities> {
  constructor(options: ActivityHandlerOptions) {
    super(options.name);
  }

  /**
   * The action to be run when an activity is triggered.
   * @param activity The activity to be run.
   */
  abstract action(activity: Activity): Promise<unknown>;

  /**
   * The cleanup action when the activity ends.
   * @param activity The activity to end.
   */
  endAction?(activity: Activity): Promise<unknown>;
}
