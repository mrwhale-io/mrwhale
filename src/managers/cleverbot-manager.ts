import { Content, Message } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { ListenerDecorators } from "../util/listener-decorators";
import { Command } from "../commands/command";
import { CleverbotPlugin } from "../plugins/cleverbot";

const { on, registerListeners } = ListenerDecorators;

export class CleverbotManager {
  private client: BotClient;
  private cleverbot: CleverbotPlugin;

  constructor(client: BotClient, token: string) {
    this.client = client;
    this.cleverbot = new CleverbotPlugin(client, token);

    registerListeners(this.client, this);
  }

  private hasCommand(message: Message) {
    const prefix = this.client.prefix;
    const commandName: string = message.textContent
      .trim()
      .slice(prefix.length)
      .trim()
      .split(" ")[0];

    const command: Command = this.client.commands.find(
      (cmd) => cmd.name.toLowerCase() === commandName.toLowerCase()
    );

    if (!command) {
      return false;
    }

    return true;
  }

  @on("message")
  private async onMessage(message: Message) {
    if (message.user.id === this.client.chat.currentUser.id) {
      return;
    }

    const hasCommand = this.hasCommand(message);

    if (!hasCommand && message.isMentioned) {
      const response = await this.cleverbot.speak(message);
      const content = new Content();

      content.insertText(response);

      return message.reply(content);
    }
  }
}
