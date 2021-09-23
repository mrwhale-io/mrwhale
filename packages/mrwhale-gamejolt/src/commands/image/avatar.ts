import axios from "axios";
import { Content, Message } from "@mrwhale-io/gamejolt-client";

import { Command } from "../command";

export default class extends Command {
  constructor() {
    super({
      name: "avatar",
      description: "Display a user's avatar.",
      type: "image",
      usage: "<prefix>avatar <@username>",
      cooldown: 5000,
    });
  }

  async action(message: Message): Promise<Message> {
    try {
      const content = new Content();
      const user = message.firstMentionOrAuthor;
      const avatarFile = await axios.get(user.img_avatar, {
        responseType: "stream",
      });

      const mediaItem = await this.client.chat.uploadFile(
        avatarFile.data,
        message.room_id
      );

      content.insertImage(mediaItem);

      return message.reply(content);
    } catch {
      return message.reply("Could not fetch avatar.");
    }
  }
}