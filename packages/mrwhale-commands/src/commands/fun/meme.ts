import axios from "axios";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "meme",
  description: "Get a random meme from Reddit.",
  type: "fun",
  usage: "<prefix>meme",
  cooldown: 3000,
};

const SUBREDDITS = {
  meme: ["dankmemes", "memes", "shitposting", "formuladank", "blursedimages"],
  anime: ["Animemes", "anime_irl", "animenocontext", "goodanimemes"],
  cats: ["MEOW_IRL"],
  comics: ["comics"],
  programming: ["ProgrammerHumor", "linuxmemes"],
};

const BASE_REDDIT_URL = "https://www.reddit.com/r";
const SORT_PARAMETER = "top";
const TIME_PARAMETER = "week";

type MemeCategory = keyof typeof SUBREDDITS;

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  url: string;
  subreddit_name_prefixed: string;
  permalink: string;
  thumbnail: string;
  ups: number;
  downs: number;
  over_18: boolean;
  is_video: boolean;
}

export async function fetchMemes(
  category: string = "meme"
): Promise<RedditPost[]> {
  if (!isValidCategory(category)) {
    throw new Error("You must pass a valid category.");
  }

  const subreddit = getRandomSubreddit(category);
  const url = `${BASE_REDDIT_URL}/${subreddit}.json?sort=${SORT_PARAMETER}&t=${TIME_PARAMETER}`;

  try {
    const response = await axios.get(url);
    return response.data.data.children
      .map((post: { data: RedditPost }) => post.data)
      .filter((post: RedditPost) => !post.over_18 && !post.is_video);
  } catch {
    throw new Error("Could not fetch memes.");
  }
}

function isValidCategory(category: string): category is MemeCategory {
  return SUBREDDITS[category] !== undefined;
}

function getRandomSubreddit(category: keyof typeof SUBREDDITS): string {
  const subreddits = SUBREDDITS[category];
  return subreddits[Math.floor(Math.random() * subreddits.length)];
}
