import axios from "axios";
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "chucknorris",
  description: "Get a random Chuck Norris joke.",
  type: "fun",
  usage: "<prefix>chucknorris",
  aliases: ["chuck", "norris"],
  cooldown: 3000,
};

export async function action(): Promise<string> {
  let url = `https://api.chucknorris.io/jokes/random`;

  try {
    const { data } = await axios.get(url);
    if (!data.value || !data.value) {
      return "Could not fetch chuck norris joke.";
    }
    return data.value;
  } catch {
    return "Could not fetch chuck norris joke.";
  }
}
