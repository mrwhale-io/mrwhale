import axios from "axios";

import { InfoBuilder } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";

export default class extends GameJoltCommand {
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

  async action(message: Message): Promise<Message> {
    try {
      const url = `mrwhale-io/mrwhale`;
      const result = await axios.get(`https://api.github.com/repos/${url}`);
      const info = new InfoBuilder()
        .addField("Repo", `https://github.com/${url}`)
        .addField("Stars", `${result.data.stargazers_count}`)
        .addField("Forks", `${result.data.forks_count}`)
        .addField("Owner", `${result.data.owner.login}`);

      return message.reply(`${info}`);
    } catch {
      return message.reply("Could not fetch repository info.");
    }
  }
}
