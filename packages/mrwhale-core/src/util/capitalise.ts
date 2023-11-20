/**
 * Capitalise the given word.
 * @param word The word to capitalise.
 */
export function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
