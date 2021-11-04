import { Message } from "@mrwhale-io/gamejolt-client";
import { CommandRateLimit, CommandRateLimiter } from "@mrwhale-io/core";

export class GameJoltCommandRateLimiter extends CommandRateLimiter {
  readonly limit: number;
  readonly duration: number;

  private readonly rateLimits: Map<number, Map<number, CommandRateLimit>>;

  constructor(limit: number, duration: number) {
    super(limit, duration);
    this.rateLimits = new Map<number, Map<number, CommandRateLimit>>();
  }

  get(message: Message): CommandRateLimit {
    if (!this.rateLimits.has(message.room_id)) {
      this.rateLimits.set(message.room_id, new Map<number, CommandRateLimit>());
    }

    if (!this.rateLimits.get(message.room_id).has(message.user.id)) {
      this.rateLimits
        .get(message.room_id)
        .set(message.user.id, new CommandRateLimit(this.limit, this.duration));
    }

    return this.rateLimits.get(message.room_id).get(message.user.id);
  }
}
