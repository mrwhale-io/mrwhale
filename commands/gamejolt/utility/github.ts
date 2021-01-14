import axios from "axios";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "github",
      description: "Get repository information.",
      type: "utility",
      usage: "<prefix>github",
      cooldown: 5000,
      aliases: ["git", "code"],
    });
  }

  async action(message: Message): Promise<void> {
    try {
      const url = `mrwhale-io/mrwhale`;
      const result = await axios.get(`https://api.github.com/repos/${url}`);
      const content = new Content().insertCodeBlock(
        `Repo: https://github.com/${url}\nStars: ${result.data.stargazers_count}\nForks: ${result.data.forks_count}\nOwner: ${result.data.owner.login}`
      );

      return message.reply(content);
    } catch {
      return message.reply("Could not fetch repository info.");
    }
  }
}
