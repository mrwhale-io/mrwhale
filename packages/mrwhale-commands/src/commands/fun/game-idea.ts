import * as seedrandom from "seedrandom";
import {
  CommandOptions,
  environments,
  genres,
  goals,
  items,
  rules,
} from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "gameidea",
  description: "Generate a random game idea.",
  type: "fun",
  usage: "<prefix>gameidea",
  cooldown: 3000,
};

const RNG = seedrandom();

interface Game {
  environment: string;
  genre: string;
  item: string;
  goal: string;
  rule: string;
}

export function action(): Game {
  const genre = genres[Math.floor(RNG() * genres.length)];
  const item = items[Math.floor(RNG() * items.length)];
  const environment = environments[Math.floor(RNG * environments.length)];
  const goal = goals[Math.floor(RNG * goals.length)];
  const rule = rules[Math.floor(RNG * rules.length)];

  const game: Game = {
    environment,
    genre,
    item,
    goal,
    rule,
  };

  return game;
}
