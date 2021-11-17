import { weather } from "@mrwhale-io/commands";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";
import * as config from "../../../config.json";
import { EMBED_COLOR } from '../../constants';

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

  async action(message: Message, [city]: [string]): Promise<void | Message> {
    if (!city) {
      return message.reply("You must provide a city name.");
    }

    return this.getWeatherResult(message, city);
  }

  async slashCommandAction(
    interaction: CommandInteraction
  ): Promise<void | Message> {
    const city = interaction.options.getString("city");

    return this.getWeatherResult(interaction, city);
  }

  private async getWeatherResult(
    message: Message | CommandInteraction,
    city: string
  ) {
    const data = await weather.action(city, config.openWeather);

    if (typeof data === "string") {
      return message.reply(data);
    }

    const embed = new MessageEmbed()
      .setTitle(`Weather for ${city}`)
      .setColor(EMBED_COLOR)
      .addField("☁️ Weather", data.weather[0].description)
      .addField("🌡️ Temperature", `${data.main.temp}°C`)
      .addField("💧 Humidity", `${data.main.humidity}`);

    if (data.clouds) {
      embed.addField("☁️ Clouds", `${data.clouds.all}% cloudiness`);
    }

    if (data.rain) {
      embed.addField(
        "🌧️ Rain",
        `${data.rain["3h"] || data.rain["1h"] || 0}mm in the last 3 hours`
      );
    }

    if (data.snow) {
      embed.addField(
        "🌨️ Snow",
        `${data.snow["3h"] || data.snow["1h"] || 0}mm in the last 3 hours`
      );
    }

    if (data.wind && data.wind.speed) {
      embed.addField("💨 Wind", `${data.wind.speed} meters per second`);
    }

    return message.reply({
      embeds: [embed],
    });
  }
}
