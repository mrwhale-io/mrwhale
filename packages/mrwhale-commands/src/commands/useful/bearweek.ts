import { CommandOptions, TimeUtilities } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "bearweek",
  description: "Countdown to bear week.",
  type: "useful",
  usage: "<prefix>bearweek",
};

const AUGUST = 8;
const BEAR_WEEK_START_DAY = 11;
const BEAR_WEEK_END_DAY = 18;

export function action(): string {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  const nextBearWeekYear = getBearWeekYear(now);
  const nextBearWeekDate = getBearWeekDate(nextBearWeekYear);

  const ms = Math.floor(nextBearWeekDate.valueOf() - now.valueOf());
  const time = TimeUtilities.convertMs(ms);

  if (
    currentMonth === AUGUST &&
    currentDay >= BEAR_WEEK_START_DAY &&
    currentDay <= BEAR_WEEK_END_DAY
  ) {
    return `It is Bear week! 🐻 Visit https://mudgolt.com/`;
  }

  return `${time.toString()} until bear week! 🐻`;
}

export function getBearWeekYear(now: Date): number {
  const nextBearWeekYear = now.getFullYear();
  const nextBearWeekDate = getBearWeekDate(nextBearWeekYear);
  if (now >= nextBearWeekDate) {
    return nextBearWeekYear + 1;
  }

  return nextBearWeekYear;
}

function getBearWeekDate(bearWeekYear: number): Date {
  return new Date(
    `${bearWeekYear}-0${AUGUST}-${BEAR_WEEK_START_DAY}T00:00:00.000Z`
  );
}
