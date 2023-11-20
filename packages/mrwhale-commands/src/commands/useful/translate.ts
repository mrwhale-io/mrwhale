import * as translate from "translate-google";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "translate",
  description:
    "Translate text to a specified language. Use 'translate langs' for supported languages.",
  type: "useful",
  usage: "<prefix>translate <lang>, <text>",
  examples: [
    "<prefix>translate es, Hello",
    "<prefix>translate auto, Hola",
    "<prefix>translate langs",
  ],
  cooldown: 3000,
};

export function languages(): {
  [key: string]: string;
} {
  return translate.languages;
}

export async function action(
  toTranslate: string,
  lang?: string
): Promise<string> {
  if (!toTranslate) {
    return "Please pass some text to translate.";
  }

  try {
    const translatedText = await translate(toTranslate, { to: lang || "en" });

    return `Translated text: ${translatedText}`;
  } catch {
    return "Translation of text failed.";
  }
}
