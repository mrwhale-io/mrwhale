import { weather } from "@mrwhale-io/commands";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { DiscordCommand } from "../../client/discord-command";
import * as config from "../../../config.json";

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

  async action(interaction: CommandInteraction): Promise<void> {
    const city = interaction.options.getString("city");
    const data = await weather.action(city, config.openWeather);

    if (typeof data === "string") {
      return interaction.reply(data);
    }

    const embed = new MessageEmbed()
      .setTitle(`Weather for ${city}`)
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

    return interaction.reply({
      embeds: [embed],
    });
  }
}
