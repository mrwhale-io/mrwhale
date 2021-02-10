import { Message } from "@mrwhale-io/gamejolt";
import * as seedrandom from "seedrandom";

import { Command } from "../command";
import { InfoBuilder } from "../../util/info-builder";
import {
  environments,
  genres,
  goals,
  items,
  rules,
} from "../../data/game-idea";

export default class extends Command {
  private rng: seedrandom.prng;

  constructor() {
    super({
      name: "gameidea",
      description: "Generate a random game idea.",
      type: "fun",
      usage: "<prefix>gameidea",
      cooldown: 3000,
    });
    this.rng = seedrandom();
  }

  async action(message: Message): Promise<void> {
    const genre = genres[Math.floor(this.rng() * genres.length)];
    const item = items[Math.floor(this.rng() * items.length)];
    const environment =
      environments[Math.floor(this.rng() * environments.length)];
    const goal = goals[Math.floor(this.rng() * goals.length)];
    const rule = rules[Math.floor(this.rng() * goals.length)];

    const info = new InfoBuilder()
      .addField("Genre", genre)
      .addField("Location", environment)
      .addField("Objective", `${goal} ${item}`)
      .addField("Rules/Mechanics", rule)
      .build();

    return message.reply(info);
  }
}
