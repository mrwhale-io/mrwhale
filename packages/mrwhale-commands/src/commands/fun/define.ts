import axios from "axios";
import * as profanity from "profanity-util";
import { CommandOptions, truncate } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "define",
  description: "Define a word or phrase.",
  type: "fun",
  usage: "<prefix>define <word>",
  examples: ["<prefix>define whale"],
  aliases: ["ud", "urban", "dictionary"],
  cooldown: 3000,
};

export async function action(phrase: string): Promise<string> {
  const url = `https://api.urbandictionary.com/v0/define?page=1&term=${phrase}`;

  if (!phrase) {
    return "You must pass a word or phrase to define.";
  }

  try {
    const { data } = await axios.get(url);
    if (!data.list || !data.list[0]) {
      return "Could not define this.";
    }
    const definition = data.list[0].definition;
    return truncate(997, profanity.purify(`${phrase} - ${definition}`)[0]);
  } catch {
    return "Could not fetch this definition.";
  }
}
