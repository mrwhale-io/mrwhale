import { define } from "@mrwhale-io/commands";
import { truncate } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";
import { GameJoltCommand } from "../../client/command/gamejolt-command";
import { MAX_MESSAGE_LENGTH } from "../../constants";

export default class extends GameJoltCommand {
  constructor() {
    super(define.data);
  }

  async action(message: Message, [phrase]: [string]): Promise<Message> {
    // Check if NSFW definitions are enabled for this room
    const allowNsfw = await this.botClient.getNsfwEnabled(message.room_id);
    const definitionResult = await define.action(phrase, allowNsfw);

    if (typeof definitionResult === "string") {
      return message.reply(definitionResult);
    }

    const totalDefinitions = definitionResult.length;

    // Randomly select a definition for variety
    const randomIndex = Math.floor(Math.random() * totalDefinitions);
    const selectedDefinition = definitionResult[randomIndex];

    // Create enhanced content with better formatting
    let definitionText = `🔎 **Word:** ${selectedDefinition.word}`;

    // Add definition counter if there are multiple definitions
    if (totalDefinitions > 1) {
      definitionText += ` *(Definition ${
        randomIndex + 1
      } of ${totalDefinitions})*`;
    }

    definitionText += `\n\n📖 **Definition:** ${selectedDefinition.definition}`;

    // Add example if available and not empty
    if (selectedDefinition.example && selectedDefinition.example.trim()) {
      definitionText += `\n\n📝 **Example:** *${selectedDefinition.example}*`;
    }

    // Add hint about additional definitions if available
    if (totalDefinitions > 1) {
      const prefix = await this.botClient.getPrefix(message.room_id);
      definitionText += `\n\n💡 There ${
        totalDefinitions === 2 ? "is" : "are"
      } ${totalDefinitions - 1} more definition${
        totalDefinitions === 2 ? "" : "s"
      } available. Try \`${prefix}define ${phrase}\` again for variety!`;
    }

    return message.reply(truncate(MAX_MESSAGE_LENGTH - 50, definitionText));
  }
}
