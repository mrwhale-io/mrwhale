/**
 * Generates a UUID (Universally Unique Identifier) version 4.
 * 
 * The UUID is generated using random numbers and follows the pattern
 * `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, where `x` is any hexadecimal digit
 * and `y` is one of `8`, `9`, `A`, or `B`.
 * 
 * @returns A randomly generated UUID v4 string.
 */
export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
