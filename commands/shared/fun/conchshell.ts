const responses = [`I don't think so.`, `Yes.`, `Try asking again.`, `No.`];

export default function conchshell(question: string): string {
  if (!question) {
    return "Ask the magic conch shell a question.";
  }

  if (question.match(/w(?:o|u|ha)t\s(?:do|to|(?:sh|w)ould)[\s\S]*/gi)) {
    return "🐚 Nothing.";
  }

  if (question.match(/(will\si\s(?:ever)?\s*get\smarried(\?*))/gi)) {
    return "🐚 Maybe someday.";
  }

  return `🐚 ${responses[Math.floor(Math.random() * responses.length)]}`;
}
