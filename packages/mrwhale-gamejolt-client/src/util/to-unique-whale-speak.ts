/**
 * Generates a string of unique whale speak.
 * @returns A string of unique whale speak.
 */
export function toUniqueWhaleSpeak(): string {
  const sounds = [
    "ee",
    "oo",
    "EO",
    "Ooo",
    "eeeOOO",
    "whuuu",
    "bwooo",
    "MOOoo",
    "aROOooo",
  ];
  const length = 5 + Math.floor(Math.random() * 5);
  const whaleMessage = Array.from(
    { length },
    () => sounds[Math.floor(Math.random() * sounds.length)]
  ).join("-");

  return whaleMessage;
}
