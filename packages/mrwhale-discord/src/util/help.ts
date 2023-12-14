import { EmbedBuilder } from "discord.js";

import { capitalise, unorderedList } from "@mrwhale-io/core";
import { DiscordBotClient } from "../client/discord-bot-client";
import { EMBED_COLOR } from "../constants";

export async function getCommandsByTypeEmbed(
  type: string,
  botClient: DiscordBotClient
) {
  if (type.includes(type.toLowerCase())) {
    const commands = botClient.commands.findByType(type);
    const appCommands = await botClient.client.application.commands.fetch();

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`${capitalise(type)} Commands`)
      .setFooter({ text: "Navigate using the menu select below" })
      .setDescription(
        unorderedList(
          commands.map((command) => {
            const commandId = appCommands.findKey(
              (cmd) => cmd.name === command.name
            );
            return `</${command.name}:${commandId}> - ${command.description}`;
          })
        )
      );

    return embed;
  }
}
