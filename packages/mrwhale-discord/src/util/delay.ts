/**
 * This will delay according to the given milliseconds.
 * @param ms The milliseconds to delay by.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
