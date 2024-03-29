import { GameJoltBotClient } from "../client/gamejolt-bot-client";

export class Timer {
  name: string;

  private client: GameJoltBotClient;
  private timer: NodeJS.Timeout | string | number | undefined;
  private ticks: number;
  private interval: number;
  private callback: () => Promise<void>;

  constructor(
    client: GameJoltBotClient,
    name: string,
    interval: number,
    callback: () => Promise<void>
  ) {
    this.name = name;
    this.client = client;
    this.interval = interval;
    this.callback = callback;
    this.ticks = 0;
    this.create();
  }

  create(): void {
    this.timer = this.client.setInterval(async () => {
      if (this.ticks >= this.interval) {
        this.ticks = 0;
      }

      if (this.ticks++ === 0) {
        this.callback().catch((e) => this.client.logger.error(e));
      }
    }, 1000);
  }

  destroy(): void {
    this.client.clearInterval(this.timer);
    this.ticks = 0;
    this.timer = undefined;
  }
}
