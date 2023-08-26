import { weather } from "@mrwhale-io/commands";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

import { DiscordCommand } from "../../client/command/discord-command";
import * as config from "../../../config.json";
import { EMBED_COLOR } from "../../constants";

export default class extends DiscordCommand {
  constructor() {
    super(weather.data);
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("city")
        .setDescription("The city to query the weather for.")
        .setRequired(true)
    );
  }

  async action(
    message: Message,
    [city]: [string]
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    if (!city) {
      return message.reply("You must provide a city name.");
    }

    return this.getWeatherResult(message, city);
  }

  async slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const city = interaction.options.getString("city");

    return this.getWeatherResult(interaction, city);
  }

  private async getWeatherResult(
    message: Message | ChatInputCommandInteraction,
    city: string
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    const data = await weather.action(city, config.openWeather);

    if (typeof data === "string") {
      return message.reply(data);
    }

    const embed = new EmbedBuilder()
      .setTitle(`Weather for ${city}`)
      .setColor(EMBED_COLOR)
      .addFields([
        { name: "☁️ Weather", value: data.weather[0].description },
        { name: "🌡️ Temperature", value: `${data.main.temp}°C` },
        { name: "💧 Humidity", value: `${data.main.humidity}` },
      ]);

    if (data.clouds) {
      embed.addFields([
        { name: "☁️ Clouds", value: `${data.clouds.all}% cloudiness` },
      ]);
    }

    if (data.rain) {
      embed.addFields([
        {
          name: "🌧️ Rain",
          value: `${
            data.rain["3h"] || data.rain["1h"] || 0
          }mm in the last 3 hours`,
        },
      ]);
    }

    if (data.snow) {
      embed.addFields([
        {
          name: "🌨️ Snow",
          value: `${
            data.snow["3h"] || data.snow["1h"] || 0
          }mm in the last 3 hours`,
        },
      ]);
    }

    if (data.wind && data.wind.speed) {
      embed.addFields([
        { name: "💨 Wind", value: `${data.wind.speed} meters per second` },
      ]);
    }

    return message.reply({
      embeds: [embed],
    });
  }
}
