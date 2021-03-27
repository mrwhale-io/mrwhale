/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param min The minimum number.
 * @param max The maximum number.
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
