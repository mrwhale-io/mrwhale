import * as seedrandom from "seedrandom";
import { Command } from "../command";
import { Message, Content } from "@mrwhale-io/gamejolt";
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
    });
    this.rng = seedrandom();
  }

  async action(message: Message) {
    const genre = genres[Math.floor(this.rng() * genres.length)];
    const item = items[Math.floor(this.rng() * items.length)];
    const environment =
      environments[Math.floor(this.rng() * environments.length)];
    const goal = goals[Math.floor(this.rng() * goals.length)];
    const rule = rules[Math.floor(this.rng() * goals.length)];

    const content = new Content().insertCodeBlock(
      `Genre: ${genre}\nLocation: ${environment}\nObjective: ${goal} ${item}\nRules/Mechanics: ${rule}`
    );

    return message.reply(content);
  }
}
