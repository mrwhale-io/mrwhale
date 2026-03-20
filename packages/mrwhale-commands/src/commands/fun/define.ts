import axios, { AxiosResponse } from "axios";

import {
  CommandOptions,
  validateContent,
  purifyText,
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

// Nonsense definition generator
const nonsenseAdjectives = [
  "fluffy",
  "sparkly",
  "invisible",
  "quantum",
  "magnetic",
  "holographic",
  "crystalline",
  "ethereal",
  "cosmic",
  "interdimensional",
  "glowing",
  "bouncy",
  "mysterious",
  "ancient",
  "digital",
  "frozen",
  "explosive",
  "telepathic",
];

const nonsenseNouns = [
  "banana",
  "robot",
  "unicorn",
  "spaceship",
  "teapot",
  "wizard",
  "dragon",
  "sandwich",
  "rainbow",
  "portal",
  "crystal",
  "hamster",
  "ninja",
  "volcano",
  "toaster",
  "galaxy",
  "penguin",
  "doorknob",
  "lighthouse",
  "octopus",
];

const nonsenseVerbs = [
  "dances with",
  "transforms into",
  "communicates with",
  "levitates above",
  "disguises as",
  "befriends",
  "quantum entangles with",
  "teleports to",
  "harmonizes with",
  "photosynthesizes",
  "materializes",
  "vibrates at",
];

const nonsenseContexts = [
  "on Tuesdays",
  "during solar eclipses",
  "in parallel dimensions",
  "when nobody's watching",
  "at exactly 3:42 AM",
  "in zero gravity",
  "while humming show tunes",
  "during thunderstorms",
  "in the presence of cats",
  "when the WiFi is down",
  "during leap years",
  "in slow motion",
];

function generateNonsenseDefinition(word: string): DefineResult {
  const adjective =
    nonsenseAdjectives[Math.floor(Math.random() * nonsenseAdjectives.length)];
  const noun = nonsenseNouns[Math.floor(Math.random() * nonsenseNouns.length)];
  const verb = nonsenseVerbs[Math.floor(Math.random() * nonsenseVerbs.length)];
  const context =
    nonsenseContexts[Math.floor(Math.random() * nonsenseContexts.length)];
  const secondNoun =
    nonsenseNouns[Math.floor(Math.random() * nonsenseNouns.length)];

  const definitionTemplates = [
    `A ${adjective} ${noun} that ${verb} ${secondNoun} ${context}.`,
    `The ancient art of ${verb} ${noun} while being ${adjective} ${context}.`,
    `${adjective} state of being that occurs when ${noun} ${verb} ${secondNoun} ${context}.`,
    `A legendary ${noun} known for its ability to become ${adjective} ${context}.`,
    `The process by which ${adjective} ${secondNoun} ${verb} ordinary ${noun} ${context}.`,
  ];

  const exampleTemplates = [
    `"I can't believe my ${noun} just became ${adjective} ${context}!"`,
    `"Every time I see a ${adjective} ${secondNoun}, I think of ${word}."`,
    `"My grandmother always said ${word} ${context}, and now I understand."`,
    `"The ${adjective} ${noun} ${verb} my ${secondNoun} yesterday."`,
  ];

  const definition =
    definitionTemplates[Math.floor(Math.random() * definitionTemplates.length)];
  const example =
    exampleTemplates[Math.floor(Math.random() * exampleTemplates.length)];

  return {
    word: word,
    definition: definition,
    example: example,
  };
}

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
      return [generateNonsenseDefinition(cleanPhrase)];
    }

    // Filter and validate definitions based on mode
    const processedDefinitions = await filterDefinitions(
      response.data.list,
      cleanPhrase,
      allowNsfw,
    );

    if (processedDefinitions.length === 0) {
      return [generateNonsenseDefinition(cleanPhrase)];
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
