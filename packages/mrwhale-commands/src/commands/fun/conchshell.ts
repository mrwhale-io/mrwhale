import { CommandOptions } from "@mrwhale-io/core";

const CONCHSHELL_RESPONSES = [
  `I don't think so.`,
  `Yes.`,
  `Try asking again.`,
  `No.`,
];

const WHAT_TO_DO_REGEX = /w(?:o|u|ha)t\s(?:do|to|(?:sh|w)ould)[\s\S]*/gi;
const MARRIED_REGEX = /(will\si\s(?:ever)?\s*get\smarried(\?*))/gi;

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

  return `🐚 ${CONCHSHELL_RESPONSES[index]}`;
}
