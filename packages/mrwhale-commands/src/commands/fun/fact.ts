import axios, { AxiosResponse } from "axios";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "fact",
  description: "Get a random useless fact.",
  type: "fun",
  usage: "<prefix>fact",
  cooldown: 3000,
};

interface FactResponse {
  text: string;
}

const USELESS_FACT_URL = `https://uselessfacts.jsph.pl/random.json?language=en`;

export async function action(): Promise<string> {
  try {
    const result: AxiosResponse<FactResponse> = await axios.get(
      USELESS_FACT_URL
    );

    return result.data.text;
  } catch {
    return "Could not fetch a fact.";
  }
}
