import { TimeUtilities, unorderedList, codeBlock } from "@mrwhale-io/core";
import { CommandInteraction, MessageEmbed, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

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

  async action(message: Message, [typeOrCmdName]: [string]): Promise<Message> {
    const types = ["fun", "utility", "useful"];
    const prefix = await this.botClient.getPrefix(message.guildId);

    if (typeOrCmdName) {
      const cmd = this.botClient.commands.findByNameOrAlias(typeOrCmdName);

      if (cmd) {
        const info = new MessageEmbed()
          .setColor(EMBED_COLOR)
          .addField("Name", cmd.name)
          .addField("Description", cmd.description)
          .addField("Type", cmd.type)
          .addField(
            "Cooldown",
            `${TimeUtilities.convertMs(cmd.rateLimiter.duration)}`
          );

        if (cmd.examples.length > 0) {
          info.addField(
            "Examples",
            `${cmd.examples.join(", ").replace(/<prefix>/g, prefix)}`
          );
        }

        if (cmd.aliases.length > 0) {
          info.addField("Aliases", `${cmd.aliases.join(", ")}`);
        }

        return message.reply({ embeds: [info] });
      }

      if (types.includes(typeOrCmdName.toLowerCase())) {
        const commands = this.botClient.commands.findByType(typeOrCmdName);

        return message.reply(
          unorderedList(
            commands.map(
              (command) => `${prefix}${command.name} - ${command.description}`
            )
          )
        );
      }

      return message.reply("Could not find this command or type.");
    }

    return message.reply(
      unorderedList(types.map((type) => `${prefix}help ${type}`))
    );
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    const typeOrName = interaction.options.getString("name");
    const types = ["fun", "utility", "useful"];

    if (typeOrName) {
      const cmd = this.botClient.commands.findByNameOrAlias(typeOrName);

      if (cmd) {
        const info = new MessageEmbed()
          .setColor(EMBED_COLOR)
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
