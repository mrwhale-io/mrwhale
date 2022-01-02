import { getCommandName, ListenerDecorators } from "@mrwhale-io/core";
import { Content, Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltBotClient } from "../gamejolt-bot-client";
import { CleverbotPlugin } from "../../plugins/cleverbot";

const { on, registerListeners } = ListenerDecorators;

export class CleverbotManager {
  private bot: GameJoltBotClient;
  private cleverbot: CleverbotPlugin;

  /**
   * Whether cleverbot is enabled.
   */
  isEnabled = false;

  /**
   * @param bot The bot client.
   * @param token The cleverbot api token.
   */
  constructor(bot: GameJoltBotClient, token: string) {
    this.bot = bot;
    this.cleverbot = new CleverbotPlugin(token);

    registerListeners(this.bot.client, this);
  }

  private async hasCommand(message: Message) {
    const prefix = await this.bot.getPrefix(message.room_id);
    const commandName = getCommandName(message.textContent, prefix);
    const command = this.bot.commands.findByNameOrAlias(commandName);

    return !!command;
  }

  @on("message")
  private async onMessage(message: Message) {
    if (message.user.id === this.bot.client.chat.currentUser.id) {
      return;
    }

    const pm = this.bot.client.chat.friendsList.getByRoom(message.room_id);
    const hasCommand = await this.hasCommand(message);

    if (this.isEnabled && !hasCommand && (pm || message.isMentioned)) {
      const user = this.bot.client.chat.currentUser;
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
