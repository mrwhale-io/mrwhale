import { dadjoke } from "@mrwhale-io/commands";
import { CommandInteraction } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(dadjoke.data);
  }

  async action(interaction: CommandInteraction): Promise<void> {
    return interaction.reply(await dadjoke.action());
  }
}
