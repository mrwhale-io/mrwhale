import { Message } from "@mrwhale-io/gamejolt";

import { BotClient } from "../bot-client";
import { Command } from "./command";
import { TimeUtilities } from "../util/time";

/**
 * Responsible for dispatching commands.
 */
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

    const prefix = this.client.getPrefix(message.room_id);

    if (!message.textContent.trim().startsWith(prefix)) {
      return;
    }

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
      return message.reply(
        `Unknown command. Use ${this.client.getPrefix(
          message.room_id
        )}help to view the command list.`
      );
    }

    if (
      command.groupOnly &&
      this.client.chat.friendsList.getByRoom(message.room_id)
    ) {
      return message.reply("This is a group only command.");
    }

    if (command.admin && message.user.id !== this.client.ownerId) {
      return message.reply("This is an admin only command.");
    }

    const room = this.client.chat.activeRooms[message.room_id];

    if (
      command.owner &&
      !message.isRoomOwner &&
      room &&
      this.client.userId !== room.owner_id &&
      !this.client.chat.friendsList.getByRoom(message.room_id)
    ) {
      return message.reply("You need to be room owner to use this command.");
    }

    if (!this.checkRateLimits(message, command)) {
      return;
    }

    const args: string[] = message.textContent
      .replace(prefix, "")
      .replace(commandName, "")
      .trim()
      .split(command.argSeparator)
      .map((arg) => arg.trim())
      .filter((arg) => arg !== "");

    await this.dispatch(command, message, args).catch((e) =>
      this.client.logger.error(e)
    );

    this.client.logger.info(
      `${message.user.username} (${message.user.id}) ran command ${command.name}`
    );
  }

  private checkRateLimits(message: Message, command: Command): boolean {
    const passed = this.checkRateLimiter(message, command);

    if (passed) {
      command.rateLimiter.get(message).call();
    }

    return passed;
  }

  private checkRateLimiter(message: Message, command: Command): boolean {
    const rateLimiter = command.rateLimiter;
    const rateLimit = rateLimiter.get(message);

    if (!rateLimit.isRateLimited) {
      return true;
    }

    if (!rateLimit.wasNotified) {
      rateLimit.setNotified();
      const timeLeft = TimeUtilities.difference(
        rateLimit.expires,
        Date.now()
      ).toString();

      if (timeLeft) {
        message.reply(`Command cooldown. Try again in ${timeLeft}.`);
      }
    }

    return false;
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
