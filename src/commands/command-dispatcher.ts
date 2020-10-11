import { Message, Content } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { Command } from "./command";

export class CommandDispatcher {
  ready = false;

  readonly client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
    this.client.on("message", (message) => this.handleMessage(message));
  }

  private async handleMessage(message: Message) {
    if (message.user.id === this.client.userId || !this.ready) {
      return;
    }

    const prefix = this.client.prefix;

    if (!message.textContent.trim().startsWith(prefix)) {
      return;
    }

    const commandName: string = message.textContent
      .trim()
      .slice(prefix.length)
      .trim()
      .split(" ")[0];

    const command: Command = this.client.commands.find(
      (cmd) => cmd.name.toLowerCase() === commandName.toLowerCase()
    );

    if (!command) {
      const content = new Content();
      content.insertText("Could not find this command.");
      message.reply(content);

      return;
    }

    const args: string[] = message.textContent
      .replace(prefix, "")
      .replace(commandName, "")
      .trim()
      .split(command.argSeparator)
      .map((arg) => arg.trim())
      .filter((arg) => arg !== "");

    await this.dispatch(command, message, args).catch(console.error);
  }

  private async dispatch(command: Command, message: Message, args: string[]) {
    return new Promise((resolve, reject) => {
      try {
        const action = command.action(message, args);
        if (action instanceof Promise) {
          action.then(resolve).catch(reject);
        } else resolve(action);
      } catch (err) {
        reject(err);
      }
    });
  }
}
