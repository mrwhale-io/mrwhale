import axios, { AxiosResponse } from "axios";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "advice",
  description:
    "Receive helpful and insightful advice to assist you in various aspects of life.",
  type: "useful",
  usage: "<prefix>advice",
  cooldown: 3000,
};

interface AdviceResponse {
  slip: { advice: string };
}

const ADVICE_URL = `https://api.adviceslip.com/advice`;

export async function action(): Promise<string> {
  try {
    const result: AxiosResponse<AdviceResponse> = await axios.get(ADVICE_URL);

    return result.data.slip.advice;
  } catch {
    return "Could not fetch advice.";
  }
}
