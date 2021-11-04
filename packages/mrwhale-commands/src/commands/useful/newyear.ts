import { CommandOptions, TimeUtilities } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "newyear",
  description: "Countdown the new year.",
  type: "useful",
  usage: "<prefix>newyear",
  aliases: ["year"],
};

export function action(): string {
  const now = new Date();
  const next = new Date(now);
  next.setFullYear(now.getFullYear() + 1);
  next.setHours(0, 0, 0, 0);
  next.setMonth(0, 1);
  const ms = next.valueOf() - now.valueOf();
  const time = TimeUtilities.convertMs(ms);

  if (ms <= 0) {
    return `Happy new year! 🎉🎆`;
  }

  return `${time}until ${next.getFullYear()}!`;
}
