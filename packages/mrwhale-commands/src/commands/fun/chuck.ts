import axios, { AxiosResponse } from "axios";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "chucknorris",
  description: "Get a random Chuck Norris joke.",
  type: "fun",
  usage: "<prefix>chucknorris",
  aliases: ["chuck", "norris"],
  cooldown: 3000,
};

const CHUCK_NORRIS_API = `https://api.chucknorris.io/jokes/random`;

interface ChuckNorrisJoke {
  value: string;
}

async function fetchChuckNorrisJoke(): Promise<ChuckNorrisJoke | undefined> {
  try {
    const response: AxiosResponse<ChuckNorrisJoke> = await axios.get(
      CHUCK_NORRIS_API
    );
    return response.data;
  } catch {
    return undefined;
  }
}

export async function action(): Promise<string> {
  const chuckNorrisJoke = await fetchChuckNorrisJoke();

  if (!chuckNorrisJoke || !chuckNorrisJoke.value) {
    return "Could not fetch Chuck Norris joke.";
  }

  return chuckNorrisJoke.value;
}
