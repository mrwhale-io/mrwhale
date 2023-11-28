import { CommandOptions } from "@mrwhale-io/core";

const CONCHSHELL_RESPONSES = [
  `I don't think so.`,
  `Yes.`,
  `Try asking again.`,
  `No.`,
];

const WHAT_TO_DO_REGEX = /\b(?:w(?:o|u|ha)t)\s(?:do|to|(?:sh|w)ould)\b/gi;
const MARRIED_REGEX = /\bwill\s(?:I\s(?:ever)?\s*get\s*married\??)\b/gi;
const NEITHER_REGEX = /\b.+\sor\s.+\b/gi;

export const data: CommandOptions = {
  name: "conchshell",
  description: "Ask the magic conchshell a question.",
  type: "fun",
  usage: "<prefix>conchshell",
  examples: ["<prefix>conchshell will i ever get married?"],
  aliases: ["conch"],
};

export function action(question: string): string {
  if (!question) {
    return "Ask the magic conch shell a question.";
  }

  const index = Math.floor(Math.random() * CONCHSHELL_RESPONSES.length);

  if (question.match(WHAT_TO_DO_REGEX)) {
    return "🐚 Nothing.";
  }

  if (question.match(MARRIED_REGEX)) {
    return "🐚 Maybe someday.";
  }

  if (question.match(NEITHER_REGEX)) {
    return "🐚 Neither.";
  }

  return `🐚 ${CONCHSHELL_RESPONSES[index]}`;
}
