import { advice } from "@mrwhale-io/commands";
import { CommandInteraction, Message } from 'discord.js';

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(advice.data);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(await advice.action());
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    return interaction.reply(await advice.action());
  }
}
