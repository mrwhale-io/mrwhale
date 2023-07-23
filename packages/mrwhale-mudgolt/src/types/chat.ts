import { Player } from "./player";

export interface Chat {
  player: Partial<Player>;
  message: string;
  date: number;
  recipiant: Partial<Player> | null;
  type: string;
}
