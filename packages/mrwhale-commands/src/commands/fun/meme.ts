import axios from "axios";
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "meme",
  description: "Get a random meme from reddit.",
  type: "fun",
  usage: "<prefix>meme",
  cooldown: 3000,
};

const MEME_URL = "https://www.reddit.com/r/dankmemes.json?sort=top&t=week";

export async function fetchMemes(): Promise<any> {
  const { data } = await axios.get(MEME_URL);
  return data.data.children
    .filter((post) => !post.data.over_18)
    .map((post) => post.data);
}
