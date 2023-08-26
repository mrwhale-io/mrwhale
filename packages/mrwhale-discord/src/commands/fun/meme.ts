import { meme } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  InteractionResponse,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { EMBED_COLOR } from "../../constants";

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
      const embed = new EmbedBuilder()
        .setTitle(memes[index].title)
        .setColor(EMBED_COLOR)
        .setDescription("Posted by " + memes[index].author)
        .setImage(memes[index].url)
        .setFooter({ text: `r/dankmemes` });

      return message.reply({
        embeds: [embed],
      });
    } catch (e) {
      return message.reply("Could not fetch memes.");
    }
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    try {
      const memes = await meme.fetchMemes();

      if (!memes.length) {
        return interaction.reply("Fresh out of memes.");
      }

      const index = Math.floor(Math.random() * memes.length);
      const embed = new EmbedBuilder()
        .setTitle(memes[index].title)
        .setColor(EMBED_COLOR)
        .setDescription("Posted by " + memes[index].author)
        .setImage(memes[index].url)
        .setFooter({ text: `r/dankmemes` });

      return interaction.reply({
        embeds: [embed],
      });
    } catch (e) {
      return interaction.reply("Could not fetch memes.");
    }
  }
}
