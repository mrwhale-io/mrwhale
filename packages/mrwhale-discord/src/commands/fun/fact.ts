import { fact } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(fact.data);
  }

  async action(interaction: CommandInteraction): Promise<void> {
    return interaction.reply(await fact.action());
  }
}