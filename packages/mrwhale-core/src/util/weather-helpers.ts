/**
 * Determines the current season based on the current month.
 *
 * @returns The current season, which can be "Winter", "Spring", "Summer", or "Fall".
 */
export function getSeason(): "Winter" | "Spring" | "Summer" | "Fall" {
  const month = new Date().getMonth() + 1;
  if ([12, 1, 2].includes(month)) {
    return "Winter";
  } else if ([3, 4, 5].includes(month)) {
    return "Spring";
  } else if ([6, 7, 8].includes(month)) {
    return "Summer";
  } else {
    return "Fall";
  }
}
