import axios, { AxiosResponse } from "axios";

import { CommandOptions, purifyText } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "define",
  description: "Define a word or phrase using Urban Dictionary.",
  type: "fun",
  usage: "<prefix>define <word>",
  examples: ["<prefix>define whale"],
  aliases: ["ud", "urban", "dictionary"],
  cooldown: 3000,
};

interface UrbanDictionaryResponse {
  list?: { definition: string }[];
}

const URBAN_DICTIONARY_URL = "https://api.urbandictionary.com/v0/define";

export async function action(phrase: string): Promise<string> {
  if (!phrase) {
    return "You must pass a word or phrase to define.";
  }

  const url = `${URBAN_DICTIONARY_URL}?page=1&term=${encodeURIComponent(
    phrase
  )}`;

  try {
    const response: AxiosResponse<UrbanDictionaryResponse> = await axios.get(
      url
    );

    if (!response.data.list || response.data.list.length === 0) {
      return "Could not define this.";
    }

    const definition = response.data.list[0].definition;
    return purifyText(`${phrase} - ${definition}`);
  } catch {
    return "Could not fetch this definition.";
  }
}
