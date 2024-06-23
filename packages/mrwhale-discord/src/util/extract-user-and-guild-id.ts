import { Interaction, Message } from "discord.js";

interface UserAndGuildId {
  userId: string;
  guildId: string;
}

/**
 * Extracts the user Id and guild Id from the interaction or message object.
 * @param interactionOrMessage The interaction or message object.
 * @returns An object containing the user ID and guild ID.
 */
export function extractUserAndGuildId(
  interactionOrMessage: Interaction | Message
): UserAndGuildId {
  const {
    user: { id: userId },
  } = interactionOrMessage.member;
  const { guildId } = interactionOrMessage;
  return { userId, guildId };
}
