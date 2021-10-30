import axios from "axios";
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "dadjoke",
  description: "Get a random Dad joke.",
  type: "fun",
  usage: "<prefix>dadjoke",
  cooldown: 3000,
};

const DAD_JOKE_URL = `https://icanhazdadjoke.com/`;

export async function action(): Promise<string> {
  try {
    const result = await axios.get(DAD_JOKE_URL, {
      headers: {
        accept: "application/json",
        "User-Agent": "axios 0.21.1",
      },
    });
    return result.data.joke;
  } catch {
    return "Could not fetch dad joke.";
  }
}
