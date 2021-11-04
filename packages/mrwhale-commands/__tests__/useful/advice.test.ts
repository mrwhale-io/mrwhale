import axios from "axios";

import { advice } from "../../src/commands/useful";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("advice", () => {
  it("should fetch advice", async () => {
    const text = "Learn from your mistakes.";
    const response = { data: { slip: { advice: text } } };
    mockedAxios.get.mockResolvedValue(response);

    const result = await advice.action();

    expect(result).toEqual(text);
  });

  it("should return error string when failed", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await advice.action();

    expect(result).toEqual("Could not fetch advice.");
  });
});
