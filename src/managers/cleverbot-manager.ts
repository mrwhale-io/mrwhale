import { Content, Message } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { ListenerDecorators } from "../util/listener-decorators";
import { Command } from "../commands/command";
import { CleverbotPlugin } from "../plugins/cleverbot";

const { on, registerListeners } = ListenerDecorators;

export class CleverbotManager {
  private client: BotClient;
  private cleverbot: CleverbotPlugin;

  /**
   * Whether cleverbot is enabled.
   */
  isEnabled = false;

  /**
   * @param client The bot client.
   * @param token The cleverbot api token.
   */
  constructor(client: BotClient, token: string) {
    this.client = client;
    this.cleverbot = new CleverbotPlugin(token);

    registerListeners(this.client, this);
  }

  private hasCommand(message: Message) {
    const prefix = this.client.getPrefix(message.room_id);
    const commandName: string = message.textContent
      .trim()
      .slice(prefix.length)
      .trim()
      .split(" ")[0];

    const command: Command = this.client.commands.find(
      (cmd) =>
        cmd.name.toLowerCase() === commandName.toLowerCase() ||
        cmd.aliases.map((alias) => alias.toLowerCase()).includes(commandName)
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

    const pm = this.client.chat.friendsList.getByRoom(message.room_id);
    const hasCommand = this.hasCommand(message);
    const canChat =
      this.isEnabled && !hasCommand && (pm || message.isMentioned);

    if (canChat) {
      const user = this.client.chat.currentUser;
      const userRegex = new RegExp(
        `((@)*${user?.username}|${user?.display_name})`,
        "i"
      );
      const response = await this.cleverbot.speak(
        message.textContent.replace(userRegex, "")
      );
      const content = new Content().insertText(
        pm ? response : `@${message.user.username} ${response}`
      );

      return message.reply(content);
    }
  }
}
