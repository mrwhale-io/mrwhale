import { CommandOptions, TimeUtilities } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "bearweek",
  description: "Countdown to bear week.",
  type: "useful",
  usage: "<prefix>bearweek",
};

export function action(): string {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const currentDay = now.getDate();
  let nextBearWeekYear = now.getFullYear();
  if (currentMonth === 8 && currentDay > 18) {
    nextBearWeekYear++;
  }

  const nextBearWeekDate = nextBearWeekYear + "-08-11T00:00:00.000Z";
  const bearWeek = new Date(nextBearWeekDate);

  const ms = Math.floor(bearWeek.getTime() - now.getTime());
  const time = TimeUtilities.convertMs(ms);

  if (currentMonth === 8 && currentDay <= 18 && currentDay >= 11) {
    return `It is Bear week! 🐻 Visit https://mudgolt.com/`;
  }

  return `${time.toString()} until bear week! 🐻`;
}
