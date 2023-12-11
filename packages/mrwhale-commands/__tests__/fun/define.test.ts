import axios from "axios";

import { define } from "../../src/commands/fun";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("define", () => {
  it("should define a word", async () => {
    const definition =
      "noun; a wealthy [patron] to a [casino], gets paid special attention by a casino host so the patron will feel comfortable to [gamble] more money.";
    const example =
      "[My whale] just walked in. He is [hosting] the [Ferrari] convention downstairs.";
    const phrase = "whale";
    const response = {
      data: { list: [{ word: phrase, definition, example }] },
    };
    mockedAxios.get.mockResolvedValue(response);

    const result = await define.action(phrase);

    expect(result).toEqual([{ word: phrase, definition, example }]);
  });

  it("should return error string when failed", async () => {
    const phrase = "whale";
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await define.action(phrase);

    expect(result).toEqual("Could not fetch this definition.");
  });

  it("should return message asking to pass in word to define", async () => {
    const result = await define.action("");

    expect(result).toEqual("You must pass a word or phrase to define.");
  });
});
