import axios from "axios";

import { define } from "../../src/commands/fun";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the core module
jest.mock("@mrwhale-io/core", () => {
  const originalModule = jest.requireActual("@mrwhale-io/core");
  return {
    ...originalModule,
    validateContent: jest.fn(() => ({ isValid: true })),
    getRandomSafetyResponse: jest.fn(() => "Safety response"),
  };
});

const mockedValidateContent = jest.mocked(
  require("@mrwhale-io/core").validateContent,
);

describe("define", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedValidateContent.mockReturnValue({ isValid: true });
  });

  it("should define a word in safe mode", async () => {
    const definition =
      "noun; a wealthy patron to a casino, gets paid special attention by a casino host so the patron will feel comfortable to gamble more money.";
    const example =
      "My whale just walked in. He is hosting the Ferrari convention downstairs.";
    const phrase = "whale";
    const response = {
      data: { list: [{ word: phrase, definition, example }] },
    };
    mockedAxios.get.mockResolvedValue(response);

    const result = await define.action(phrase, false);

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result[0]).toEqual({
        word: phrase,
        definition,
        example,
      });
    }
  });

  it("should define a word in NSFW mode", async () => {
    const definition =
      "noun; a wealthy patron to a casino, gets paid special attention by a casino host so the patron will feel comfortable to gamble more money.";
    const example =
      "My whale just walked in. He is hosting the Ferrari convention downstairs.";
    const phrase = "whale";
    const response = {
      data: { list: [{ word: phrase, definition, example }] },
    };
    mockedAxios.get.mockResolvedValue(response);

    const result = await define.action(phrase, true);

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result[0]).toEqual({
        word: phrase,
        definition,
        example,
      });
    }
  });

  it("should return error string when failed", async () => {
    const phrase = "whale";
    mockedAxios.get.mockRejectedValue(new Error("Async error."));

    const result = await define.action(phrase, false);

    expect(result).toEqual("Could not fetch this definition.");
  });

  it("should return message asking to pass in word to define", async () => {
    const result = await define.action("", false);

    expect(result).toEqual("You must pass a word or phrase to define.");
  });

  it("should return nonsense definition when no results found", async () => {
    const phrase = "nonexistentword123";
    const response = { data: { list: [] } };
    mockedAxios.get.mockResolvedValue(response);

    const result = await define.action(phrase, false);

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('word', phrase);
      expect(result[0]).toHaveProperty('definition');
      expect(result[0]).toHaveProperty('example');
      expect(typeof result[0].definition).toBe('string');
      expect(typeof result[0].example).toBe('string');
    }
  });

  it("should handle inappropriate search terms in safe mode", async () => {
    // Mock validateContent to return false for the search term
    mockedValidateContent.mockReturnValue({ isValid: false });

    const result = await define.action("inappropriateword", false);
    
    // When content validation fails for search term, it should return a string error message
    expect(typeof result).toBe("string");
    expect(result).toEqual("I can't look up definitions for that word.");
  });

  it("should return nonsense definition when all definitions are filtered out", async () => {
    const phrase = "testword";
    const response = {
      data: { 
        list: [{
          definition: "This is an inappropriate definition that will be filtered",
          example: "Inappropriate example"
        }]
      }
    };
    mockedAxios.get.mockResolvedValue(response);

    // First call for search term validation (allow search)
    // Subsequent calls for definition validation (block definitions)
    mockedValidateContent
      .mockReturnValueOnce({ isValid: true })  // Allow search term
      .mockReturnValue({ isValid: false });     // Block definition content

    const result = await define.action(phrase, false);

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('word', phrase);
      expect(result[0]).toHaveProperty('definition');
      expect(result[0]).toHaveProperty('example');
    }
  });

  it("should handle long search terms", async () => {
    const longPhrase = "a".repeat(100);
    const result = await define.action(longPhrase, false);
    
    expect(result).toEqual("That word or phrase is too long to define.");
  });

  it("should handle timeout errors", async () => {
    const phrase = "whale";
    const timeoutError = new Error("Request timeout") as Error & { code: string };
    timeoutError.code = "ECONNABORTED";
    mockedAxios.get.mockRejectedValue(timeoutError);

    const result = await define.action(phrase, false);

    expect(result).toEqual("The definition lookup timed out. Please try again.");
  });
});
