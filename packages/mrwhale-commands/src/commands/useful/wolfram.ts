import { CommandOptions } from "@mrwhale-io/core";
import * as WolframAlphaAPI from "wolfram-alpha-api";

export const data: CommandOptions = {
  name: "wolfram",
  description: "Compute answers using Wolfram alpha.",
  type: "useful",
  usage: "<prefix>wolfram <query>",
  cooldown: 3000,
};

export async function action(query: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    return "No API key provided for wolfram.";
  }

  if (!query) {
    return "Please provide a query.";
  }

  try {
    const waApi = WolframAlphaAPI(apiKey);
    const result = await waApi.getShort(query);

    return result;
  } catch {
    return "Could not fetch result.";
  }
}
