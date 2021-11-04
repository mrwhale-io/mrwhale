import { TimeUtilities, unorderedList, codeBlock } from "@mrwhale-io/core";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "help",
      description: "Get command help.",
      type: "utility",
      usage: "<prefix>help <type|cmd>",
      cooldown: 5000,
    });
    this.slashCommandData.addStringOption((option) =>
      option.setName("name").setDescription("The type or name of the command.")
    );
  }

  async action(interaction: CommandInteraction): Promise<void> {
    const typeOrName = interaction.options.getString("name");
    const types = ["fun", "utility", "useful"];

    if (typeOrName) {
      const cmd = this.botClient.commands.findByNameOrAlias(typeOrName);

      if (cmd) {
        const info = new MessageEmbed()
          .addField("Name", cmd.name)
          .addField("Description", cmd.description)
          .addField("Type", cmd.type)
          .addField(
            "Cooldown",
            `${TimeUtilities.convertMs(cmd.rateLimiter.duration)}`
          );

        return interaction.reply({ embeds: [info] });
      }

      if (types.includes(typeOrName.toLowerCase())) {
        const commands = this.botClient.commands.findByType(typeOrName);

        return interaction.reply(
          codeBlock(
            unorderedList(
              commands.map(
                (command) => `/${command.name} - ${command.description}`
              )
            )
          )
        );
      }

      return interaction.reply("Could not find this command or type.");
    }

    return interaction.reply(
      codeBlock(unorderedList(types.map((type) => `/help ${type}`)))
    );
  }
}
