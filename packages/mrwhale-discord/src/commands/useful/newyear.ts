import { newyear } from "@mrwhale-io/commands";
import { CommandInteraction, Message } from 'discord.js';

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(newyear.data);
  }

  async action(message: Message): Promise<Message> {
    return message.reply(newyear.action());
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    return interaction.reply(newyear.action());
  }
}
