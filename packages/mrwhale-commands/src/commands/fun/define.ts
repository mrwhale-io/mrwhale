import axios, { AxiosResponse } from "axios";

import {
  CommandOptions,
  validateContent,
  purifyText,
  getRandomSafetyResponse,
  truncate,
} from "@mrwhale-io/core";

// Safety configuration
const MAX_DEFINITION_LENGTH = 1000;
const MAX_EXAMPLE_LENGTH = 300;
const MIN_DEFINITION_LENGTH = 10;
const MAX_PHRASE_LENGTH = 50;

export const data: CommandOptions = {
  name: "define",
  description: "Define a word or phrase using Urban Dictionary.",
  type: "fun",
  usage: "<prefix>define <word>",
  examples: ["<prefix>define whale"],
  aliases: ["ud", "urban", "dictionary"],
  cooldown: 3000,
};

interface UrbanDictionaryResponse {
  list?: { definition: string; example: string }[];
}

interface DefineResult {
  word: string;
  definition: string;
  example: string;
}

const URBAN_DICTIONARY_URL = "https://api.urbandictionary.com/v0/define";

export async function action(
  phrase: string,
  allowNsfw: boolean,
): Promise<string | DefineResult[]> {
  if (!phrase) {
    return "You must pass a word or phrase to define.";
  }

  // Basic input validation
  const cleanPhrase = phrase.trim();
  if (cleanPhrase.length > MAX_PHRASE_LENGTH) {
    return "That word or phrase is too long to define.";
  }

  // Check if the search term itself is inappropriate
  const searchTermValidation = validateContent(cleanPhrase);
  if (!searchTermValidation.isValid && !allowNsfw) {
    return "I can't look up definitions for that word.";
  }

  const url = `${URBAN_DICTIONARY_URL}?page=1&term=${encodeURIComponent(
    cleanPhrase,
  )}`;

  try {
    const response: AxiosResponse<UrbanDictionaryResponse> = await axios.get(
      url,
      {
        timeout: 10000, // 10 second timeout
        headers: {
          "User-Agent": "Mr Whale Bot",
        },
      },
    );

    if (!response.data.list || response.data.list.length === 0) {
      return "Could not find a definition for that word.";
    }

    // Filter and validate definitions based on mode
    const processedDefinitions = await filterDefinitions(
      response.data.list,
      cleanPhrase,
      allowNsfw,
    );

    if (processedDefinitions.length === 0) {
      return allowNsfw
        ? "No suitable definitions found, even after content filtering."
        : getRandomSafetyResponse("definitions");
    }

    return processedDefinitions;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return "The definition lookup timed out. Please try again.";
    }
    return "Could not fetch this definition.";
  }
}

/**
 * Filters definitions based on content appropriateness and mode.
 * In safe mode, it excludes any definitions that contain inappropriate content.
 * In NSFW mode, it sanitizes definitions that contain inappropriate content, but still includes them if they have enough valid content after sanitization.
 *
 * @param definitions The raw definitions from the API.
 * @param word The original word being defined (used for context in sanitization).
 * @param allowNsfw Whether NSFW content is allowed (true for NSFW mode, false for safe mode).
 * @returns An array of processed definitions that are safe to display based on the mode.
 */
async function filterDefinitions(
  definitions: { definition: string; example: string }[],
  word: string,
  allowNsfw: boolean,
): Promise<DefineResult[]> {
  const processedDefinitions: DefineResult[] = [];

  for (const def of definitions) {
    // Initial text cleaning
    let cleanDefinition = def.definition?.trim() || "";
    let cleanExample = def.example?.trim() || "";

    // Skip if too short or too long before processing
    if (
      cleanDefinition.length < MIN_DEFINITION_LENGTH ||
      cleanDefinition.length > MAX_DEFINITION_LENGTH
    ) {
      continue;
    }

    // Validate content
    const definitionValidation = validateContent(cleanDefinition);
    const exampleValidation = cleanExample
      ? validateContent(cleanExample)
      : { isValid: true };

    if (!definitionValidation.isValid || !exampleValidation.isValid) {
      if (!allowNsfw) {
        // Safe mode: skip inappropriate content entirely
        continue;
      } else {
        // NSFW mode: purify the content
        cleanDefinition = purifyText(cleanDefinition);
        if (cleanExample) {
          cleanExample = purifyText(cleanExample);
        }
      }
    }

    processedDefinitions.push({
      word: purifyText(word),
      definition: cleanDefinition,
      example: truncate(MAX_EXAMPLE_LENGTH, cleanExample),
    });
  }

  return processedDefinitions;
}
