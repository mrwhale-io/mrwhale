import { CommandOptions, TimeUtilities } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "bearweek",
  description: "Countdown to bear week.",
  type: "useful",
  usage: "<prefix>bearweek",
};

export function action(): string {
  const now = new Date();
  const from = new Date();
  const to = new Date();
  from.setMonth(7);
  from.setDate(11);
  to.setMonth(7);
  to.setDate(from.getDate() + 7);
  console.log(to, from);
  const ms = from.valueOf() - now.valueOf();
  const time = TimeUtilities.convertMs(ms);

  if (now.getTime() <= to.getTime() && now.getTime() >= from.getTime()) {
    return `It is Bear week! Visit https://mudgolt.com/`;
  }

  return `${time}until bear week! 🐻`;
}
