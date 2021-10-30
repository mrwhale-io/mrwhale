import axios from "axios";
import { InfoBuilder } from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import * as config from "../../../config.json";

export default class extends GameJoltCommand {
  constructor() {
    super({
      name: "weather",
      description: "Get the weather.",
      type: "useful",
      usage: "<prefix>weather <city>",
      cooldown: 3000,
    });
  }

  async action(message: Message, [city]: [string]): Promise<Message> {
    try {
      if (!city) {
        return message.reply("You must provide a city name.");
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${config.openWeather}&units=metric`;

      const result = await axios.get(url);

      const info = new InfoBuilder()
        .addField("☁️ Weather", result.data.weather[0].description)
        .addField("🌡️ Temperature", `${result.data.main.temp}°C`)
        .addField("💧 Humidity", result.data.main.humidity);

      if (result.data.clouds) {
        info.addField("☁️ Clouds", `${result.data.clouds.all}% cloudiness`);
      }

      if (result.data.rain) {
        info.addField(
          "🌧️ Rain",
          `${
            result.data.rain["3h"] || result.data.rain["1h"] || 0
          }mm in the last 3 hours`
        );
      }

      if (result.data.snow) {
        info.addField(
          "🌨️ Snow",
          `${
            result.data.snow["3h"] || result.data.snow["1h"] || 0
          }mm in the last 3 hours`
        );
      }

      if (result.data.wind && result.data.wind.speed) {
        info.addField("💨 Wind", `${result.data.wind.speed} meters per second`);
      }

      return message.reply(`${info}`);
    } catch {
      return message.reply("Could not fetch weather.");
    }
  }
}
