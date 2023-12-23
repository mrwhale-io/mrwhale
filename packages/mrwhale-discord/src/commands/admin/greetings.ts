import {
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
  } from "discord.js";
  
  import { DiscordCommand } from "../../client/command/discord-command";
  
  export default class extends DiscordCommand {
    constructor() {
      super({
        name: "greetings",
        description: "Toggle greetings on and off.",
        type: "admin",
        usage: "<prefix>greetings",
        guildOnly: true,
        callerPermissions: ["Administrator"],
      });
    }
  
    async action(
      message: Message
    ): Promise<Message<boolean> | InteractionResponse<boolean>> {
      return this.enableGreetings(message);
    }
  
    async slashCommandAction(
      interaction: ChatInputCommandInteraction
    ): Promise<Message<boolean> | InteractionResponse<boolean>> {
      return this.enableGreetings(interaction);
    }
  
    private async enableGreetings(
      interaction: Message | ChatInputCommandInteraction
    ): Promise<Message<boolean> | InteractionResponse<boolean>> {
      let enabled = await this.isGreetingsEnabled(interaction.guildId);
      enabled = !enabled;
  
      const settings = this.botClient.guildSettings.get(interaction.guildId);
  
      if (settings) {
        settings.set("greetings", enabled);
      }
  
      return enabled
        ? interaction.reply("Greetings enabled.")
        : interaction.reply("Greetings disabled.");
    }
  
    private async isGreetingsEnabled(guildId: string): Promise<boolean> {
      if (!this.botClient.guildSettings.has(guildId)) {
        return false;
      }
  
      const settings = this.botClient.guildSettings.get(guildId);
  
      return await settings.get("greetings", false);
    }
  }
  