import { coin } from "@mrwhale-io/commands";
import { CommandInteraction, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(coin.data);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(coin.action());
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    return interaction.reply(coin.action());
  }
}
