import { FishTypeNames } from "./fish-type-names";

export interface Fish {
  id: number;
  name: FishTypeNames;
  icon: string;
  worth: number;
  expWorth: number;
  hpWorth: number;
  probability: number;
}
