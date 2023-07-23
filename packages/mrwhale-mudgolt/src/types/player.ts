export interface Player {
  id: number;
  publicKey: string;
  username: string;
  roomId: number;
  golts: number;
  description: string;
  lastPaid: number;
}
