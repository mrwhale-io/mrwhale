import axios, { AxiosResponse } from "axios";

import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "weather",
  description: "Get the current weather for the given location.",
  type: "useful",
  usage: "<prefix>weather <city>",
  cooldown: 3000,
};

interface WeatherData {
  coord: { lon: number; lat: number };
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
  };
  base: string;
  weather: {
    id: number;
    description: string;
    main: string;
    icon: string;
  }[];

  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  rain: { [key: string]: string };
  snow: { [key: string]: string };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

const OPENWEATHER_API_BASE_URL =
  "https://api.openweathermap.org/data/2.5/weather";

export async function action(
  city: string,
  apiKey: string
): Promise<WeatherData | string> {
  if (!city) {
    return "You must provide a city name.";
  }

  if (!apiKey) {
    return "API key is missing. Please provide a valid API key.";
  }

  try {
    const url = buildWeatherApiUrl(city, apiKey);
    const response: AxiosResponse<WeatherData> = await axios.get(url);
    return response.data;
  } catch {
    return "Could not fetch weather.";
  }
}

function buildWeatherApiUrl(city: string, apiKey: string): string {
  return `${OPENWEATHER_API_BASE_URL}?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;
}
