import axios from "axios";
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "chucknorris",
  description: "Get a random Chuck Norris joke.",
  type: "fun",
  usage: "<prefix>chucknorris <firstname> <lastname> <category>",
  aliases: ["chuck", "norris"],
  cooldown: 3000,
};

export async function action(
  firstName: string,
  lastName: string,
  category: string
): Promise<string> {
  let url = `http://api.icndb.com/jokes/random?escape=javascript`;
  if (firstName) {
    url += `&firstName=${firstName}`;
  }

  if (lastName) {
    url += `&lastName=${lastName}`;
  }

  if (category) {
    url += `&category=[${category}]`;
  }

  try {
    const { data } = await axios.get(url);
    if (!data.value || !data.value.joke) {
      return "Could not fetch chuck norris joke.";
    }
    return data.value.joke;
  } catch {
    return "Could not fetch chuck norris joke.";
  }
}
