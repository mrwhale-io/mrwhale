import axios from "axios";

import { weather } from "../../src/commands/useful";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const apiKey = "abc123456789";
const city = "London";
const data = {
  coord: { lon: -0.1257, lat: 51.5085 },
  weather: [{ description: "london" }],
  base: "stations",
  main: {
    temp: 10.3,
    feels_like: 9.42,
    temp_min: 9.09,
    temp_max: 11.26,
    pressure: 993,
    humidity: 78,
  },
  visibility: 10000,
  wind: { speed: 6.17, deg: 220 },
  clouds: { all: 5 },
  dt: 1635719604,
  sys: {
    type: 2,
    id: 2019646,
    country: "GB",
    sunrise: 1635663138,
    sunset: 1635698146,
  },
  timezone: 0,
  id: 2643743,
  name: "London",
  cod: 200,
};

describe("weather", () => {
  it("should fetch weather", async () => {
    const response = { data };
    mockedAxios.get.mockResolvedValue(response);

    const result = await weather.action(city, apiKey);

    expect(result).toEqual(data);
  });

  it("should return message asking to pass city", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await weather.action("", apiKey);

    expect(result).toEqual("You must provide a city name.");
  });

  it("should return error string when failed", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await weather.action(city, apiKey);

    expect(result).toEqual("Could not fetch weather.");
  });
});
