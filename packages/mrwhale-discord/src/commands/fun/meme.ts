import { meme } from "@mrwhale-io/commands";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super(meme.data);
  }

  async action(interaction: CommandInteraction): Promise<void> {
    try {
      const memes = await meme.fetchMemes();

      if (!memes.length) {
        return interaction.reply("Fresh out of memes.");
      }

      const index = Math.floor(Math.random() * memes.length);
      const embed = new MessageEmbed()
        .setTitle(memes[index].title)
        .setDescription("Posted by " + memes[index].author)
        .setImage(memes[index].url)
        .setFooter(`r/dankmemes`);

      return interaction.reply({
        embeds: [embed],
      });
    } catch (e) {
      return interaction.reply("Could not fetch memes.");
    }
  }
}
