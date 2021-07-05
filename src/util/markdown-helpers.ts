/**
 * Return bold markdown text.
 * @param text The text to make bold.
 */
export const bold: (text: string) => string = (text: string) => `**${text}**`;

/**
 * Return code markdown text.
 * @param text The text to add to code.
 */
export const code: (text: string) => string = (text: string) => `\`${text}\``;

/**
 * Return codeblock markdown text.
 * @param text The text to add to codeblock.
 */
export const codeBlock: (text: string, language?: string) => string = (
  text: string,
  language?: string
) =>
  language
    ? `\`\`\`\n#${language}\n${text}\n\`\`\``
    : `\`\`\`\n${text}\n\`\`\``;

/**
 * Return italic markdown text.
 * @param text The text to make italic.
 */
export const italic: (text: string) => string = (text: string) => `*${text}*`;

/**
 * Return link markdown text.
 * @param title The title of the link.
 * @param href The hyperlink.
 */
export const link: (title: string, href: string) => string = (
  title: string,
  href: string
) => `[${title}](${href})`;

/**
 * Return unordered list markdown text.
 * @param items The items in the unordered list.
 */
export const unorderedList: (items: string[]) => string = (items: string[]) =>
  items.map((item) => `- ${item}`).join("\n");

/**
 * Return ordered list markdown text.
 * @param items The items in the ordered list.
 */
export const orderedList: (text: string[]) => string = (items: string[]) =>
  items.map((item, index) => `${index + 1}. ${item}`).join("\n");
