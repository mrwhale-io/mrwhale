import {
  TimeUtilities,
  getCommandName,
  getCommandArgs,
  dispatch,
} from "@mrwhale-io/core";
import { Message } from "@mrwhale-io/gamejolt-client";

import { GameJoltBotClient } from "../gamejolt-bot-client";
import { GameJoltCommand } from "./gamejolt-command";

export class GameJoltCommandDispatcher {
  readonly bot: GameJoltBotClient;

  set ready(value: boolean) {
    this._ready = value;
  }

  private _ready = false;

  constructor(bot: GameJoltBotClient) {
    this.bot = bot;
    this.bot.client.on("message", (message) => this.handleMessage(message));
  }

  private async handleMessage(message: Message) {
    if (message.user.id === this.bot.client.userId || !this._ready) {
      return;
    }

    const blockedUsersIds = this.bot.client.blockedUsers.map(
      (blocked) => blocked.user.id
    );

    if (blockedUsersIds && blockedUsersIds.includes(message.user.id)) {
      return;
    }

    const prefix = await this.bot.getPrefix(message.room_id);

    if (!message.textContent.trim().startsWith(prefix)) {
      return;
    }

    const commandName = getCommandName(message.textContent, prefix);
    const command = this.bot.commands.findByNameOrAlias(commandName);

    if (!command) {
      return message.reply(
        `Unknown command. Use ${prefix}help to view the command list.`
      );
    }

    if (command.groupOnly && this.bot.friendsList.getByRoom(message.room_id)) {
      return message.reply("This is a group only command.");
    }

    if (command.admin && message.user.id !== this.bot.ownerId) {
      return message.reply("This is an admin only command.");
    }

    const room = this.bot.chat.activeRooms[message.room_id];

    if (
      command.owner &&
      !message.isRoomOwner &&
      room &&
      this.bot.client.userId !== room.owner_id &&
      !this.bot.friendsList.getByRoom(message.room_id)
    ) {
      return message.reply("You need to be room owner to use this command.");
    }

    if (!this.checkRateLimits(message, command)) {
      return;
    }

    const args = getCommandArgs(
      message.textContent,
      prefix,
      command.argSeparator
    );

    await dispatch(command, message, args).catch((e) =>
      this.bot.logger.error(e)
    );

    this.bot.logger.info(
      `${message.user.username} (${message.user.id}) ran command ${command.name}`
    );
  }

  private checkRateLimits(message: Message, command: GameJoltCommand): boolean {
    const passed = this.checkRateLimiter(message, command);

    if (passed) {
      command.rateLimiter.get(message).call();
    }

    return passed;
  }

  private checkRateLimiter(
    message: Message,
    command: GameJoltCommand
  ): boolean {
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
}
