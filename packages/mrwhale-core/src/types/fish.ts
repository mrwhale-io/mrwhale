import { FishTypeNames } from "./fish-type-names";

export interface Fish {
  name: FishTypeNames;
  icon: string;
  worth: number;
  expWorth: number;
  hpWorth: number;
  probability: number;
}
