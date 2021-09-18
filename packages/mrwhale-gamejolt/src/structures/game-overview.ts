export class GameOverview {
  profileCount: number;
  downloadCount: number;
  playCount: number;

  constructor(data: Partial<GameOverview>) {
    Object.assign(this, data);
  }
}
