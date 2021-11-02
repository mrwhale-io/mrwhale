import { InfoBuilder } from "@mrwhale-io/core";
import { weather } from "@mrwhale-io/commands";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltCommand } from "../../client/command/gamejolt-command";
import * as config from "../../../config.json";

export default class extends GameJoltCommand {
  constructor() {
    super(weather.data);
  }

  async action(message: Message, [city]: [string]): Promise<Message> {
    if (!city) {
      return message.reply("You must provide a city name.");
    }

    const data = await weather.action(city, config.openWeather);

    if (typeof data === "string") {
      return message.reply(data);
    }

    const info = new InfoBuilder()
      .addField("☁️ Weather", data.weather[0].description)
      .addField("🌡️ Temperature", `${data.main.temp}°C`)
      .addField("💧 Humidity", data.main.humidity);

    if (data.clouds) {
      info.addField("☁️ Clouds", `${data.clouds.all}% cloudiness`);
    }

    if (data.rain) {
      info.addField(
        "🌧️ Rain",
        `${data.rain["3h"] || data.rain["1h"] || 0}mm in the last 3 hours`
      );
    }

    if (data.snow) {
      info.addField(
        "🌨️ Snow",
        `${data.snow["3h"] || data.snow["1h"] || 0}mm in the last 3 hours`
      );
    }

    if (data.wind && data.wind.speed) {
      info.addField("💨 Wind", `${data.wind.speed} meters per second`);
    }

    return message.reply(`${info}`);
  }
}
