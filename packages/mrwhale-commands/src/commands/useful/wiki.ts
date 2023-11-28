import wiki from "wikijs";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "wiki",
  description: "Search for a Wikipedia page.",
  type: "useful",
  usage: "<prefix>wiki <query>",
  examples: ["<prefix>wiki whale"],
  cooldown: 3000,
};

interface WikiResult {
  summary: string;
  image: string;
  url: string;
}

const WIKI_SEARCH_LIMIT = 1;

export async function action(query: string): Promise<WikiResult | string> {
  if (!query) {
    return "Please provide a search.";
  }

  try {
    const search = await wiki().search(query.trim(), WIKI_SEARCH_LIMIT);
    if (!search) {
      return "No results found.";
    }

    const page = await wiki().page(search.results[0]);
    const [summary, image, url] = await Promise.all([
      page.summary(),
      page.mainImage(),
      page.url(),
    ]);

    return { summary, image, url: url.toString() };
  } catch {
    return "An error occurred while searching for this wiki.";
  }
}
