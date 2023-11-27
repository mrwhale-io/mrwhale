import { CommandOptions, TimeUtilities } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "bearweek",
  description: "Countdown to bear week.",
  type: "useful",
  usage: "<prefix>bearweek",
};

const AUGUST = 8;

export function action(): string {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const currentDay = now.getDate();
  let nextBearWeekYear = now.getFullYear();
  if (now >= new Date(`${nextBearWeekYear}-08-19T00:00:00.000Z`)) {
    nextBearWeekYear++;
  }

  const nextBearWeekDate = `${nextBearWeekYear}-08-11T00:00:00.000Z`;
  const bearWeek = new Date(nextBearWeekDate);

  const ms = Math.floor(bearWeek.valueOf() - now.valueOf());
  const time = TimeUtilities.convertMs(ms);

  if (currentMonth === AUGUST && currentDay <= 18 && currentDay >= 11) {
    return `It is Bear week! 🐻 Visit https://mudgolt.com/`;
  }

  return `${time.toString()} until bear week! 🐻`;
}
