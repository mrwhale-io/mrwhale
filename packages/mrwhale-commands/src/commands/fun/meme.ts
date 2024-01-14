import axios from "axios";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "meme",
  description: "Get a random meme from Reddit.",
  type: "fun",
  usage: "<prefix>meme",
  cooldown: 5000,
};

export const SUBREDDITS = {
  meme: [
    "dankmemes",
    "memes",
    "shitposting",
    "formuladank",
    "blursedimages",
    "me_irl",
  ],
  anime: ["Animemes", "anime_irl", "animenocontext", "goodanimemes"],
  cats: ["MEOW_IRL"],
  comics: ["comics"],
  programming: ["ProgrammerHumor", "linuxmemes"],
};

const BASE_MEME_URL = "https://meme-api.com/gimme";
const LIMIT = 25;

type MemeCategory = keyof typeof SUBREDDITS;

export interface RedditPost {
  postLink: string;
  subreddit: string;
  title: string;
  author: string;
  url: string;
  ups: number;
  spoiler: boolean;
  nsfw: boolean;
  preview: string[];
}

interface ApiResponse {
  count: number;
  memes: RedditPost[];
}

export async function fetchMemes(
  category: string = "meme"
): Promise<RedditPost[]> {
  if (!isValidCategory(category)) {
    throw new Error("You must pass a valid category.");
  }

  const subreddit = getRandomSubreddit(category);
  const url = `${BASE_MEME_URL}/${subreddit}/${LIMIT}`;

  try {
    const { data } = await axios.get<ApiResponse>(url);
    return data.memes.filter((meme) => !meme.nsfw);
  } catch {
    throw new Error("Could not fetch memes.");
  }
}

export function isValidCategory(category: string): category is MemeCategory {
  return SUBREDDITS[category] !== undefined;
}

function getRandomSubreddit(category: keyof typeof SUBREDDITS): string {
  const subreddits = SUBREDDITS[category];
  return subreddits[Math.floor(Math.random() * subreddits.length)];
}
