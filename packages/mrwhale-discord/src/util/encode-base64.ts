/**
 * Creates a Base64 encoded string from a binary string.
 * @param data The string to encode.
 */
export const encodeBase64 = (data: string) =>
  Buffer.from(data).toString("base64");
