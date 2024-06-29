/**
 * This will delay according to the given milliseconds.
 * @param ms The milliseconds to delay by.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a random delay in milliseconds within a specified range.
 *
 * @param minSeconds The minimum delay in seconds.
 * @param maxSeconds The maximum delay in seconds.
 * @returns The random delay in milliseconds.
 */
export function getRandomDelayInMilliseconds(
  minSeconds: number,
  maxSeconds: number
): number {
  return (
    Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) *
    1000
  );
}
