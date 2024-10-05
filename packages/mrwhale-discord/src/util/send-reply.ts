import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";

/**
 * Sends a reply to the interaction or message.
 * @param interactionOrMessage The interaction or message to reply to.
 * @param embed The embed to send as a reply.
 * @param ephemeral Whether the reply is ephemeral or not.
 * @returns A promise that resolves to the sent message.
 */
export async function sendReply(
  interactionOrMessage:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | Message,
  embed: EmbedBuilder,
  ephemeral: boolean = false
): Promise<Message<boolean>> {
  if (interactionOrMessage instanceof Message) {
    return await interactionOrMessage.reply({
      embeds: [embed],
      allowedMentions: { users: [] },
    });
  } else {
    return await interactionOrMessage.reply({
      embeds: [embed],
      allowedMentions: { users: [] },
      fetchReply: true,
      ephemeral,
    });
  }
}
