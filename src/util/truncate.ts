/**
 * Truncate strings after max lengths.
 * @param n Maximum string length before truncating with ...
 * @param text The string to truncate.
 */
export function truncate(n: number, text: string): string {
  return text.length > n ? text.substr(0, n - 1) + "..." : text;
}
