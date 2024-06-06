import { Achievement, Fish } from "@mrwhale-io/core";

export interface CatchResult {
  fishCaught: Fish;
  achievements: Achievement[];
}
