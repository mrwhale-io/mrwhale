import axios, { AxiosResponse } from "axios";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "dadjoke",
  description: "Get a random Dad joke.",
  type: "fun",
  usage: "<prefix>dadjoke",
  cooldown: 3000,
};

interface DadJokeResponse {
  joke: string;
}

const DAD_JOKE_URL = `https://icanhazdadjoke.com/`;
const HEADERS = {
  accept: "application/json",
  "User-Agent": "axios 0.21.1",
};

export async function action(): Promise<string> {
  try {
    const result: AxiosResponse<DadJokeResponse> = await axios.get(
      DAD_JOKE_URL,
      {
        headers: HEADERS,
      }
    );
    return result.data.joke;
  } catch {
    return "Could not fetch dad joke.";
  }
}
