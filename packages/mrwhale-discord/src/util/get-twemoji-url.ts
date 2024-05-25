/**
 * Gets a twemoji image url with the given unicode emoji.
 */
export function getTwemojiUrl(emoji: string): string {
  const codePoint = emoji.codePointAt(0).toString(16);
  return `https://twemoji.maxcdn.com/v/latest/72x72/${codePoint}.png`;
}
