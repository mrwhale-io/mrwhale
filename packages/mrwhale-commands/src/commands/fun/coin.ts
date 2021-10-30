import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "coin",
  description: "Flip a coin.",
  usage: "<prefix>coin",
  type: "fun",
  aliases: ["flip"],
};

export function action(): string {
  return Math.random() > 0.5 ? `🎲 Heads!` : `🎲 Tails!`;
}
