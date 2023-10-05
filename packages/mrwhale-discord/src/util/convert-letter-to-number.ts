/**
 * Convert a given letter to a number.
 * @param letter The letter to convert.
 */
export function convertLetterToNumber(letter: string): number {
  return letter
    .toUpperCase()
    .split("")
    .reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 65, 0);
}
