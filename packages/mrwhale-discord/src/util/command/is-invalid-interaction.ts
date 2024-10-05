import { Interaction, Message } from "discord.js";

/**
 * Checks if the interaction is invalid.
 * @param messageOrInteraction The message or interaction to check.
 * @returns True if the interaction is invalid.
 */
export function isInvalidInteraction(
  messageOrInteraction: Message | Interaction
): boolean {
  return (
    !messageOrInteraction.guild ||
    !messageOrInteraction.member ||
    !messageOrInteraction.member.user ||
    messageOrInteraction.member.user.bot
  );
}
