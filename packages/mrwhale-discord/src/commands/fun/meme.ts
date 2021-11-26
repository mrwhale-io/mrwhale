import { meme } from "@mrwhale-io/commands";
import { CommandInteraction, MessageEmbed, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from '../../constants';

export default class extends DiscordCommand {
  constructor() {
    super(meme.data);
  }

  async action(message: Message): Promise<Message> {
    try {
      const memes = await meme.fetchMemes();

      if (!memes.length) {
        return message.reply("Fresh out of memes.");
      }

      const index = Math.floor(Math.random() * memes.length);
      const embed = new MessageEmbed()
        .setTitle(memes[index].title)
        .setColor(EMBED_COLOR)
        .setDescription("Posted by " + memes[index].author)
        .setImage(memes[index].url)
        .setFooter(`r/dankmemes`);

      return message.reply({
        embeds: [embed],
      });
    } catch (e) {
      return message.reply("Could not fetch memes.");
    }
  }

  async slashCommandAction(interaction: CommandInteraction): Promise<void> {
    try {
      const memes = await meme.fetchMemes();

      if (!memes.length) {
        return interaction.reply("Fresh out of memes.");
      }

      const index = Math.floor(Math.random() * memes.length);
      const embed = new MessageEmbed()
        .setTitle(memes[index].title)
        .setColor(EMBED_COLOR)
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
