import * as profanity from "profanity-util";

/**
 * Removes profanity from the given text.
 * @param text The string to purify.
 */
export const purifyText = (text: string): string => profanity.purify(text)[0];
