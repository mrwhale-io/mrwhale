import wiki from "wikijs";
import { CommandOptions, truncate } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "wiki",
  description: "Search for a Wiki page.",
  type: "useful",
  usage: "<prefix>wiki <query>",
  examples: ["<prefix>wiki whale"],
  cooldown: 3000,
};

export async function action(query: string): Promise<string> {
  if (!query) {
    return "Please provide a search.";
  }

  try {
    const search = await wiki().search(query.trim(), 1);
    const page = await wiki().page(search.results[0]);
    const summary = await page.summary();

    return truncate(980, summary);
  } catch {
    return "I couldn't search for this wiki.";
  }
}
