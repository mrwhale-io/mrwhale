import axios from "axios";
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "advice",
  description: "Get advice.",
  type: "useful",
  usage: "<prefix>advice",
  cooldown: 3000,
};

const ADVICE_URL = `https://api.adviceslip.com/advice`;

export async function action(): Promise<string> {
  try {
    const result = await axios.get(ADVICE_URL);

    return result.data.slip.advice;
  } catch {
    return "Could not fetch advice.";
  }
}
