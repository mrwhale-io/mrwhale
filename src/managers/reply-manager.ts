import { Message } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { ListenerDecorators } from "../util/listener-decorators";

const { on, registerListeners } = ListenerDecorators;

export class ReplyManager {
  constructor(private client: BotClient) {
    registerListeners(this.client, this);
  }

  @on("message")
  protected async onMessage(message: Message) {
    if (message.user.id === this.client.chat.currentUser.id) {
      return;
    }

    const regex = /O_{1,5}O/i;
    if (message.textContent.match(regex)) {
      return message.reply(message.toString().match(regex)[0]);
    }
  }
}
