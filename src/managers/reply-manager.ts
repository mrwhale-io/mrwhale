import { Content, Message } from "@mrwhale-io/gamejolt";

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

    const content = new Content();
    if (message.textContent.match(/O[\\?_]+O/)) {
      content.insertText(message.toString().match(/O[?_]+O/)[0]);

      return message.reply(content);
    }
  }
}
