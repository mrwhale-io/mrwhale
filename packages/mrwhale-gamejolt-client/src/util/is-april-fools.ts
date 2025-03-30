/**
 * Determines whether the current date is April Fools' Day (April 1st).
 *
 * @returns `true` if the current date is April 1st, otherwise `false`.
 */
export function isAprilFools(): boolean {
  const now = new Date();
  return now.getDate() === 1 && now.getMonth() === 3 - 1;
}
