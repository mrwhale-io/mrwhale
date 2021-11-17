import { dadjoke } from "@mrwhale-io/commands";
import { CommandInteraction, Message } from 'discord.js';

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(dadjoke.data);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(await dadjoke.action());
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    return interaction.reply(await dadjoke.action());
  }
}
