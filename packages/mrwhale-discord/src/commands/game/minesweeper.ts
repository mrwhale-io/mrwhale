import { Collection, Message, codeBlock } from "discord.js";

import {
  MinesweeperGame,
  minesweeperWonMessages,
  minesweeperLostMessages,
  createMinesweeperGame,
  minesweeperErrorMessages,
} from "@mrwhale-io/core";
import { DiscordCommand } from "../../client/command/discord-command";
import { convertLetterToNumber } from "../../util/convert-letter-to-number";

export default class extends DiscordCommand {
  private games: Collection<string, MinesweeperGame>;

  constructor() {
    super({
      name: "minesweeper",
      description: "Play minesweeper. A classic.",
      usage:
        "<prefix>minesweeper <start|end> [easy|medium|hard], " +
        "After starting a game, use <prefix>reveal to reveal a tile, " +
        "<prefix>flag to flag a tile, and <prefix>unflag to unflag a tile.",
      aliases: ["flag", "unflag", "reveal"],
      examples: [
        "<prefix>minesweeper start",
        "<prefix>reveal 5 C",
        "<prefix>flag 6 D",
        "<prefix>unflag 5 C",
      ],
      type: "game",
      argSeparator: " ",
      cooldown: 3000,
      guildOnly: true,
    });
    this.games = new Collection<string, MinesweeperGame>();
  }

  async action(message: Message, args: string[]): Promise<any> {
    const channelId = message.channel.id;
    const prefix = await this.botClient.getPrefix(message.guild.id);
    const formattedPrefix = this.getFormattedPrefix(prefix);

    const game = this.games.get(channelId);
    if (game) {
      if (game.timedOut) {
        const response =
          this.invokedWith === this.name
            ? minesweeperErrorMessages.timedOutStartingNewGame()
            : minesweeperErrorMessages.timedOut();

        message.channel.send(response);
        if (this.invokedWith !== this.name) {
          return this.endGame(message);
        }
        game.forceLose();
      }

      if (game.gameOver) {
        this.games.delete(channelId);
      }
    }

    const command = args[0];
    if (this.invokedWith === this.name && command === "start") {
      return this.startGame(message, args);
    } else if (this.invokedWith === this.name && command === "end") {
      return this.endGame(message);
    } else if (this.invokedWith === this.name) {
      return this.startGame(message, ["start", command]);
    }

    if (!this.games.has(channelId)) {
      return message.channel.send(minesweeperErrorMessages.noGameRunning());
    }

    if (args.length < 2) {
      return message.channel.send(
        minesweeperErrorMessages.invalidCoordinate(
          formattedPrefix,
          this.invokedWith
        )
      );
    }

    switch (this.invokedWith) {
      case "reveal":
        return this.runCommand("reveal", message, args);
      case "flag":
        return this.runCommand("flag", message, args);
      case "unflag":
        return this.runCommand("unflag", message, args);
    }
  }

  private async startGame(
    message: Message,
    args: string[]
  ): Promise<Message<false> | Message<true>> {
    const channelId = message.channel.id;
    const authorId = message.author.id;
    const prefix = await this.botClient.getPrefix(message.guild.id);
    const formattedPrefix = this.getFormattedPrefix(prefix);

    if (this.games.has(channelId)) {
      return message.channel.send(
        minesweeperErrorMessages.gameAlreadyRunning(formattedPrefix)
      );
    }

    const difficulty = args[1]?.toLowerCase();
    const game = createMinesweeperGame(authorId, difficulty || "medium");

    this.games.set(channelId, game);
    game.start();

    return message.channel.send(this.constructGameScreen(game));
  }

  private async endGame(message: Message): Promise<Message | Message[]> {
    const channelId = message.channel.id;
    const game = this.games.get(channelId);

    if (!game) {
      return message.channel.send(minesweeperErrorMessages.cantEndGame());
    }

    if (game.owner !== message.author.id) {
      return message.channel.send(minesweeperErrorMessages.notGameOwner());
    }

    game.forceLose();
    game.revealAllTiles();
    message.channel.send(codeBlock(game.playingFieldString));
    message.channel.send(
      "You revealed " +
        game.revealedTileCount.toString() +
        " out of " +
        game.totalTileCount.toString() +
        " tile."
    );
    const lostMessageIndex = Math.round(
      Math.random() * (minesweeperLostMessages.length - 1)
    );
    const minesweeperLostMessage = minesweeperLostMessages[lostMessageIndex];
    return message.channel.send(
      `Game finished... You lost. ${minesweeperLostMessage}`
    );
  }

  private constructGameScreen(game: MinesweeperGame): string {
    let gamePlayingField = game.playingFieldString;

    gamePlayingField +=
      "\nTile left: " +
      (
        game.totalTileCount -
        game.totalMineCount -
        game.revealedTileCount
      ).toString() +
      " | Uncovered tile: " +
      game.revealedTileCount.toString();
    gamePlayingField +=
      "\nTotal tile count: " +
      game.totalTileCount.toString() +
      " | There are " +
      game.totalMineCount.toString() +
      " mines";
    gamePlayingField +=
      "\nYou flagged " + game.flaggedTileCount.toString() + " tile";
    gamePlayingField += "\nYou have " + game.timeLeftString + " seconds left!";

    return codeBlock(gamePlayingField);
  }

  private async runCommand(
    command: "reveal" | "flag" | "unflag",
    message: Message,
    args: string[]
  ): Promise<any> {
    const channelId = message.channel.id;
    const game = this.games.get(channelId);

    if (!game) {
      return message.channel.send(minesweeperErrorMessages.noGameRunning());
    }

    const prefix = await this.botClient.getPrefix(message.guild.id);
    const formattedPrefix = this.getFormattedPrefix(prefix);

    const [xTilePos, yTilePos] = args.map((arg, index) =>
      index === 0 ? parseInt(arg, 10) : convertLetterToNumber(arg)
    );

    if (isNaN(xTilePos) || isNaN(yTilePos)) {
      return message.channel.send(
        minesweeperErrorMessages.invalidCoordinate(formattedPrefix, command)
      );
    }

    if (
      xTilePos >= game.xTileSize ||
      yTilePos >= game.yTileSize ||
      xTilePos < 0 ||
      yTilePos < 0
    ) {
      return message.channel.send(
        minesweeperErrorMessages.coordinateOutOfRange()
      );
    }

    if (game.isFlagged(xTilePos, yTilePos)) {
      return message.channel.send(
        minesweeperErrorMessages.alreadyFlaggedTile()
      );
    }

    if (game.isRevealed(xTilePos, yTilePos)) {
      return message.channel.send(minesweeperErrorMessages.alreadyRevealed());
    }

    switch (command) {
      case "reveal":
        game.revealTile(xTilePos, yTilePos);
        break;
      case "flag":
        game.flagTile(xTilePos, yTilePos);
        break;
      case "unflag":
        game.unFlagTile(xTilePos, yTilePos);
        break;
    }

    if (game.gameOver) {
      this.gameOver(message, game);
    } else {
      message.channel.send(this.constructGameScreen(game));
    }
  }

  private gameOver(message: Message, game: MinesweeperGame) {
    game.revealAllTiles();
    const gameResultMessage = game.won ? "You won!" : "You lost.";
    const gameModifier = game.won
      ? minesweeperWonMessages
      : minesweeperLostMessages;
    const randomModifier =
      gameModifier[Math.floor(Math.random() * gameModifier.length)];

    message.channel.send(codeBlock(game.playingFieldString));
    message.channel.send(
      `Game finished... ${gameResultMessage} ${randomModifier}`
    );

    if (!game.won) {
      message.channel.send(
        `You revealed ${game.revealedTileCount} out of ${game.totalTileCount} tiles.`
      );
    }
  }

  private getFormattedPrefix(prefix: string): string {
    return prefix.length > 1 ? prefix + " " : prefix;
  }
}
