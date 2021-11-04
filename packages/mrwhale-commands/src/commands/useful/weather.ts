import axios from "axios";
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "weather",
  description: "Get the weather.",
  type: "useful",
  usage: "<prefix>weather <city>",
  cooldown: 3000,
};

export async function action(city: string, apiKey: string): Promise<any> {
  if (!city) {
    return "You must provide a city name.";
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    const result = await axios.get(url);

    return result.data;
  } catch {
    return "Could not fetch weather.";
  }
}
