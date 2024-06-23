/**
 * Converts a pascal case string to a sentence.
 *
 * @param pascalCase The pascal case input to convert.
 * @returns The converted pascal case input.
 */
export function pascalCaseToWords(pascalCase: string): string {
  return pascalCase.replace(/([A-Z][a-z])/g, " $1").toLowerCase();
}
