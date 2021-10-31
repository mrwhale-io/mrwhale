import axios from "axios";

import { dadjoke } from "../../src/commands/fun";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("dadjoke", () => {
  it("should fetch a dadjoke", async () => {
    const joke = "I used to hate facial hair, but then it grew on me.";
    const response = { data: { joke } };
    mockedAxios.get.mockResolvedValue(response);

    const result = await dadjoke.action();

    expect(result).toEqual(joke);
  });

  it("should return error string when failed", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await dadjoke.action();

    expect(result).toEqual("Could not fetch dad joke.");
  });
});
