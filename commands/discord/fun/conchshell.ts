import { Message } from "discord.js";
import { CommandoClient, CommandoMessage, Command } from "discord.js-commando";

import conchshell from "../../shared/fun/conchshell";

export default class extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "conchshell",
      description: "Ask the magic conchshell a question.",
      group: "fun",
      memberName: "conchshell",
      examples: ["conchshell will i ever get married?"],
      aliases: ["conch"],
    });
  }

  run = async (
    message: CommandoMessage,
    [question]: [string]
  ): Promise<Message> => message.channel.send(conchshell(question));
}
