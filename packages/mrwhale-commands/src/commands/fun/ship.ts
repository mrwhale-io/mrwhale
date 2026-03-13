import crypto = require("crypto");

import { CommandOptions, validateContent } from "@mrwhale-io/core";

const MAX_NAME_LENGTH = 50;

export const data: CommandOptions = {
  name: "ship",
  description: "Calculate and display the compatibility between two users.",
  type: "fun",
  usage: "<prefix>ship <person1>, <person2>",
  examples: [
    "<prefix>ship @User1, @User2",
    "<prefix>ship Alice, Bob",
    "<prefix>ship Mr. Whale, Mrs. Whale",
  ],
};

export interface ShipResult {
  /**
   * The percentage of compatibility between two users.
   */
  percent: number;

  /**
   * The ship name of the two users.
   */
  shipName: string;

  /**
   * A description of the match.
   */
  description: string;

  /**
   * A prediction of the match.
   */
  prediction: string;

  /**
   * A breakdown of the compatibility between the two users
   */
  breakdown: string;

  /**
   * A random fact about compatibility.
   */
  randomFact: string;

  /**
   * A scale of hearts based on the compatibility percentage.
   */
  emojiScale: string;
}

export function action(firstUser: string, secondUser: string): ShipResult {
  const { firstUser: cleanFirstUser, secondUser: cleanSecondUser } =
    validateAndSanitizeNames(firstUser, secondUser);

  // Sort users for consistent hash generation
  const users = [
    cleanFirstUser.toLowerCase(),
    cleanSecondUser.toLowerCase(),
  ].sort();

  const hash = crypto.createHash("md5").update(users.toString()).digest("hex");

  const result = hash
    .split("")
    .filter((h) => !isNaN(parseInt(h, 10)))
    .join("");

  const percent = parseInt(result.substr(0, 2), 10);

  return {
    description: getMatchDescription(percent),
    shipName: getShipName(cleanFirstUser, cleanSecondUser),
    percent,
    prediction: getPrediction(percent),
    breakdown: getBreakdown(percent),
    randomFact: getRandomFact(),
    emojiScale: getEmojiScale(percent),
  };
}

function validateAndSanitizeNames(firstUser: string, secondUser: string) {
  if (!firstUser) {
    throw "First user is missing.";
  }

  if (!secondUser) {
    throw "Second user is missing.";
  }

  // Validate length limits
  if (firstUser.length > MAX_NAME_LENGTH) {
    throw "First user name is too long. Please use a shorter name.";
  }

  if (secondUser.length > MAX_NAME_LENGTH) {
    throw "Second user name is too long. Please use a shorter name.";
  }

  // Validate content of both user names
  const firstUserValidation = validateContent(firstUser.trim());
  if (!firstUserValidation.isValid) {
    throw "First user name contains inappropriate content. Please use a family-friendly name.";
  }

  const secondUserValidation = validateContent(secondUser.trim());
  if (!secondUserValidation.isValid) {
    throw "Second user name contains inappropriate content. Please use a family-friendly name.";
  }

  return { firstUser, secondUser };
}

/**
 * Generates a string of heart emojis representing a percentage.
 *
 * @param percent The percentage to convert into heart emojis. Should be a number between 0 and 100.
 * @returns A string containing red heart emojis (❤️) and white heart emojis (🤍) representing the given percentage.
 *          Each red heart represents 10% and each white heart represents the remaining percentage up to 100%.
 */
function getEmojiScale(percent: number): string {
  const hearts = Math.floor(percent / 10);
  const emptyHearts = 10 - hearts;
  return "❤️".repeat(hearts) + "🤍".repeat(emptyHearts);
}

/**
 * Generates a ship name from two usernames.
 *
 * @param firstUser The first user's name.
 * @param secondUser The second user's name.
 * @returns A ship name generated from the two usernames.
 */
function getShipName(firstUser: string, secondUser: string): string {
  const part1 = firstUser.trim().substring(0, Math.ceil(firstUser.length / 2));
  const part2 = secondUser.trim().substring(Math.floor(secondUser.length / 2));
  return `${part1}${part2}`;
}

/**
 * Generates a random compatibility fact.
 *
 * @returns A random compatibility fact.
 */
function getRandomFact(): string {
  const facts = [
    "💡 Did you know? Opposites attract!",
    "💡 Fun fact: Shared interests boost compatibility!",
    "💡 Did you know? Laughter is the best way to a strong bond!",
    "💡 Fun fact: Communication is key in any relationship!",
    "💡 Did you know? Trust is the foundation of any relationship!",
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Generates a prediction based on a compatibility percentage.
 *
 * @param percent The compatibility percentage.
 * @returns A prediction based on the compatibility percentage.
 */
function getPrediction(percent: number): string {
  if (percent >= 90) {
    return "💍 Wedding bells are in the air!";
  }

  if (percent >= 70) {
    return "💐 A beautiful friendship blossoming into love!";
  }

  if (percent >= 50) {
    return "🍕 Maybe a casual dinner date is in order!";
  }

  if (percent >= 30) {
    return "🤷 Just friends? Or something more?";
  }

  return "💤 Probably better to stay apart.";
}

/**
 * Generates a breakdown of the compatibility percentage.
 *
 * @param percent The compatibility percentage.
 * @returns A breakdown of the compatibility percentage.
 */
function getBreakdown(percent: number): string {
  const personality = Math.floor(percent * 0.4 + Math.random() * 10); // 40% weight
  const hobbies = Math.floor(percent * 0.3 + Math.random() * 10); // 30% weight
  const humor = Math.floor(percent * 0.3 + Math.random() * 10); // 30% weight

  return `Personality: ${personality}%\nHobbies: ${hobbies}%\nHumor: ${humor}%`;
}

/**
 * Generates a description of the compatibility percentage.
 *
 * @param percent The compatibility percentage.
 * @returns A description of the compatibility percentage.
 */
function getMatchDescription(percent: number): string {
  if (percent >= 90) {
    return "🌟 A match made in heaven! True love! 🌟";
  }

  if (percent >= 70) {
    return "💖 A strong connection, full of potential! 💖";
  }

  if (percent >= 50) {
    return "😊 There's definitely a spark here! 😊";
  }

  if (percent >= 30) {
    return "😬 It's a bit rocky, but who knows? 😬";
  }

  return "💔 It might not be meant to be... 💔";
}
