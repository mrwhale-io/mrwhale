import crypto = require("crypto");
import { CommandOptions } from "@mrwhale-io/core";

export const data: CommandOptions = {
  name: "ship",
  description: "Find out how compatible two users are.",
  type: "fun",
  usage: "<prefix>ship person1, person2",
  examples: ["<prefix>ship Mr. Whale, Mrs. Whale"],
};

export function action(firstUser: string, secondUser: string): string {
  if (!firstUser) {
    return "First user is missing.";
  }

  if (!secondUser) {
    return "Second user is missing.";
  }

  const users = [
    firstUser.trim().toLowerCase(),
    secondUser.trim().toLowerCase(),
  ].sort();

  const hash = crypto.createHash("md5").update(users.toString()).digest("hex");

  const result = hash
    .split("")
    .filter((h) => !isNaN(parseInt(h, 10)))
    .join("");

  const percent = parseInt(result.substr(0, 2), 10);

  return `💘 There's a ${percent}% match between ${firstUser} and ${secondUser} 💘`;
}
