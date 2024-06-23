import { EmbedBuilder } from "discord.js";

import { EMBED_COLOR } from "../../constants";

/**
 * Creates an embed message with the given description.
 * @param description The description text for the embed message.
 * @returns An EmbedBuilder instance with the provided description.
 */
export function createEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder().setColor(EMBED_COLOR).setDescription(description);
}
