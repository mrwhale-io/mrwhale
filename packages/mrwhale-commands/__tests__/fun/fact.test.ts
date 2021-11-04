import axios from "axios";

import { fact } from "../../src/commands/fun";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("fact", () => {
  it("should fetch a fact", async () => {
    const text =
      "It takes about 142.18 licks to reach the center of a Tootsie pop.";
    const response = { data: { text } };
    mockedAxios.get.mockResolvedValue(response);

    const result = await fact.action();

    expect(result).toEqual(text);
  });

  it("should return error string when failed", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await fact.action();

    expect(result).toEqual("Could not fetch a fact.");
  });
});
