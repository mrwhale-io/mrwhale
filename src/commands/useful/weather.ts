import axios from "axios";
import { Content, Message } from "@mrwhale-io/gamejolt";

import { Command } from "../command";
import * as config from "../../../config.json";

export default class extends Command {
  constructor() {
    super({
      name: "weather",
      description: "Get the weather.",
      type: "useful",
      usage: "<prefix>weather",
      cooldown: 3000,
    });
  }

  async action(message: Message, [city]: [string]): Promise<void> {
    try {
      if (!city) {
        return message.reply("You must provide a city name.");
      }
      const content = new Content();
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${config.openWeather}&units=metric`;
                                   
      const result = await axios.get(url);

      let response = `☁️ Weather: ${result.data.weather[0].description}\n🌡️ Temperature: ${result.data.main.temp}°C\n💧 Humidity: ${result.data.main.humidity}\n`;

      if (result.data.clouds) {
        response += `☁️ Clouds: ${result.data.clouds.all}% cloudiness\n`;
      }

      if (result.data.rain) {
        response += `🌧️ Rain: ${
          result.data.rain["3h"] || result.data.rain["1h"] || 0
        }mm in the last 3 hours\n`;
      }

      if (result.data.snow) {
        response += `🌨️ Snow: ${
          result.data.snow["3h"] || result.data.snow["1h"] || 0
        }mm in the last 3 hours\n`;
      }

      if (result.data.wind && result.data.wind.speed) {
        response += `💨 Wind: ${result.data.wind.speed} meters per second`;
      }

      content.insertCodeBlock(response);

      return message.reply(content);
    } catch {
      return message.reply("Could not fetch weather.");
    }
  }
}
