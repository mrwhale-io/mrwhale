import { Message } from "@mrwhale-io/gamejolt";
import axios from "axios";
import * as qs from "querystring";

import { Command } from "../command";

const config = require("../../../config.json");

export default class extends Command {
  constructor() {
    super({
      name: "pastebin",
      description: "Upload a paste to pastebin.",
      type: "useful",
      usage: "<prefix>pastebin <paste>",
    });
  }

  async action(message: Message, [paste]: [string]) {
    if (!config.pastebin) {
      return message.reply("No API key provided for pastebin.");
    }

    if (!paste || paste === "") {
      return message.reply("Please provide a paste to upload.");
    }

    const url = `https://pastebin.com/api/api_post.php`;
    const requestConfig = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const body = {
      api_option: "paste",
      api_paste_code: paste,
      api_dev_key: config.pastebin,
    };

    const result = await axios.post(url, qs.stringify(body), requestConfig);

    return message.reply(result.data);
  }
}
