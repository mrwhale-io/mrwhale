import { CommandOptions, eyes } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "whale",
  description: "Generate a whale face.",
  type: "fun",
  usage: "<prefix>whale <length>",
  examples: ["<prefix>whale 10"],
  cooldown: 3000,
};

const MIN = 5;
const MAX = 50;

export function action(size?: number): string {
  const whaleSize = Math.min(Math.max(size, MIN), MAX);

  let whale = "";
  const whaleEyes = eyes[Math.floor(Math.random() * eyes.length)];

  whale += whaleEyes[0];
  for (let i = 0; i < whaleSize; i++) {
    whale += "_";
  }
  whale += whaleEyes[1];

  return whale;
}
