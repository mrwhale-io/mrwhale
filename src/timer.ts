import { BotClient } from "./bot-client";

export class Timer {
  name: string;

  private client: BotClient;
  private timer: NodeJS.Timer;
  private ticks: number;
  private interval: number;
  private callback: () => Promise<void>;

  constructor(
    client: BotClient,
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

  create() {
    this.timer = this.client.setInterval(async () => {
      if (this.ticks >= this.interval) {
        this.ticks = 0;
      }

      if (this.ticks++ === 0) {
        this.callback().catch(console.error);
      }
    }, 1000);
  }

  destroy() {
    this.client.clearInterval(this.timer);
    this.ticks = 0;
    this.timer = undefined;
  }
}
