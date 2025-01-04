import { CommandOptions } from "@mrwhale-io/core";

const CONCHSHELL_RESPONSES = [
  `I don't think so.`,
  `Yes.`,
  `Try asking again.`,
  `No.`,
  `Absolutely!`,
  `Not in this lifetime.`,
  `Ask later.`,
  `Only if you believe.`,
  `Why not?`,
  `It's possible.`,
  `Definitely not.`,
  `The odds are in your favor.`,
  `The stars say no.`,
  `Ask next time.`,
];

const CONCHSHELL_PERSONALITY_RESPONSES = [
  `Why do you bother me with such questions?`,
  `Do you really want to know?`,
  `The conch is tired today.`,
  `Hmm... let me think. Nope.`,
  `You're asking the wrong shell.`,
];

const WHAT_TO_DO_REGEX = /\bwhat\s(?:do|to|should|would)\b/gi;
const MARRIED_REGEX = /\bwill\s+i\s+(?:ever\s+)?get\s+married\??\b/gi;
const NEITHER_REGEX = /\b(?:[^?]+\s+or\s+[^?]+)\b/gi;
const LIFE_ADVICE_REGEX = /\b(?:should|how)\s(?:i|we|one)\s.+\b/gi;
const LOVE_QUESTIONS_REGEX = /\b(?:love|crush|relationship|married|dating)\b/gi;

export const data: CommandOptions = {
  name: "conchshell",
  description:
    "Ask the magic conchshell a question and receive a wise (or snarky) answer.",
  type: "fun",
  usage: "<prefix>conchshell <question>",
  examples: [
    "<prefix>conchshell will I ever get married?",
    "<prefix>conchshell should I eat pizza or tacos?",
    "<prefix>conchshell what should I do?",
  ],
  aliases: ["conch"],
};

export function action(question: string): string {
  if (!question) {
    return "🐚 You must ask the magic conch shell a question, like 'Will I find treasure?'";
  }

  // Handle overly long questions
  if (question.length > 200) {
    return "🐚 Your question is too long. The conch is confused. Try again.";
  }

  // Special cases based on regex matches
  if (question.match(WHAT_TO_DO_REGEX)) {
    return "🐚 Nothing.";
  }

  if (question.match(MARRIED_REGEX)) {
    return "🐚 Maybe someday.";
  }

  if (question.match(NEITHER_REGEX)) {
    return "🐚 Neither.";
  }

  if (question.match(LIFE_ADVICE_REGEX)) {
    return "🐚 Follow your heart.";
  }

  if (question.match(LOVE_QUESTIONS_REGEX)) {
    return "🐚 Love is complicated. Try asking again.";
  }

  if (question.toLowerCase().includes("treasure")) {
    return "🐚 Treasure? You mean my secret stash? Keep dreaming.";
  }

  if (question.toLowerCase().includes("whale")) {
    return "🐚 Mr. Whale knows best. Go ask him.";
  }

  // Personality responses (20% chance)
  const randomPersonalityResponse = Math.random() < 0.2;
  if (randomPersonalityResponse) {
    return `🐚 ${
      CONCHSHELL_PERSONALITY_RESPONSES[
        Math.floor(Math.random() * CONCHSHELL_PERSONALITY_RESPONSES.length)
      ]
    }`;
  }

  // Default random response
  const index = Math.floor(Math.random() * CONCHSHELL_RESPONSES.length);
  return `🐚 ${CONCHSHELL_RESPONSES[index]}`;
}
