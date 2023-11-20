import axios from "axios";

import { chuck } from "../../src/commands/fun";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("chuck", () => {
  it("should fetch a chucknorris joke", async () => {
    const joke =
      "Chuck Norris does not need to type-cast. The Chuck-Norris Compiler (CNC) sees through things. All way down. Always.";
    const response = { data: { value: joke } };
    mockedAxios.get.mockResolvedValue(response);

    const result = await chuck.action();

    expect(result).toEqual(joke);
  });

  it("should return error string when failed", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await chuck.action();

    expect(result).toEqual("Could not fetch Chuck Norris joke.");
  });
});
