/**
 * Adds a delay before retrying.
 *
 * @param ms The delay in milliseconds.
 * @returns A Promise that resolves after the specified delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
