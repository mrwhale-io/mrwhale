import { ChatInputCommandInteraction, Message } from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import { createEmbed } from "../../util/embed/create-embed";
import { Activities } from "../../types/activities/activities";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "nextfishspawn",
      description: "Check when the next fish spawn event will occur.",
      type: "fishing",
      usage: "<prefix>nextfishspawn",
      guildOnly: true,
      cooldown: 3000,
    });
  }

  async action(message: Message): Promise<void> {
    await this.getNextFishSpawn(message);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await this.getNextFishSpawn(interaction);
  }

  private async getNextFishSpawn(
    interactionOrMessage: Message | ChatInputCommandInteraction
  ): Promise<void> {
    const { guildId } = interactionOrMessage;

    // Fetch the next fish spawn event for the guild
    const nextFishSpawn = this.botClient.activityScheduler.getUpcomingActivityByType(
      guildId,
      Activities.FishSpawn
    );

    if (!nextFishSpawn) {
      const noSpawnEmbed = createEmbed(
        "There is no upcoming fish spawn event scheduled."
      ).setTitle("No Upcoming Fish Spawn");

      if (interactionOrMessage instanceof Message) {
        await interactionOrMessage.reply({ embeds: [noSpawnEmbed] });
      } else {
        await interactionOrMessage.reply({ embeds: [noSpawnEmbed] });
      }
      return;
    }

    // Calculate time remaining until the next spawn
    const timeUntilSpawn = `<t:${Math.floor(
      nextFishSpawn.startTime / 1000
    )}:R>`; // Displays the time in relative format in Discord

    const spawnEmbed = createEmbed(
      `The next fish spawn event is scheduled to occur ${timeUntilSpawn}.`
    )
      .setTitle("Next Fish Spawn")
      .setTimestamp();

    // Send the embed with the next spawn time
    if (interactionOrMessage instanceof Message) {
      await interactionOrMessage.reply({ embeds: [spawnEmbed] });
    } else {
      await interactionOrMessage.reply({ embeds: [spawnEmbed] });
    }
  }
}
