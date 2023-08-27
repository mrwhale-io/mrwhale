import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  User,
  escapeMarkdown,
} from "discord.js";
import { TimeUtilities, HangmanGame } from "@mrwhale-io/core";

import { DiscordCommand } from "../../client/command/discord-command";

export default class extends DiscordCommand {
  constructor() {
    super({
      name: "hangman",
      description: "Play a classic game of hangman.",
      usage: "<prefix>hangman <guess>",
      examples: ["<prefix>hangman a"],
      type: "game",
      argSeparator: " ",
      cooldown: 3000,
    });
    this.slashCommandData.addStringOption((option) =>
      option
        .setName("guess")
        .setDescription("The letter to guess.")
        .setRequired(false)
    );
    this.games = new Map<string, HangmanGame>();
  }

  private games: Map<string, HangmanGame>;

  async action(
    message: Message,
    [input]: [string, string]
  ): Promise<Message<boolean> | InteractionResponse<boolean>> {
    // Check if there are any existing games in progress for this channel.
    if (!this.games.has(message.channelId)) {
      return this.start(message.author, message);
    }

    // Destroy the game after 10 minutes.
    const diff = TimeUtilities.difference(
      Date.now(),
      this.games.get(message.channelId).startTime
    );

    if (diff.seconds > 600) {
      this.games.delete(message.channelId);
      if (input) {
        return message.reply(
          "The game has expired. Use `hangman` to start a new game."
        );
      }
      return this.start(message.author, message);
    }

    if (
      this.games.get(message.channelId).isGameOver ||
      this.games.get(message.channelId).won
    ) {
      return this.start(message.author, message);
    }

    this.guess(message, input);
  }

  slashCommandAction(
    interaction: ChatInputCommandInteraction
  ): Promise<Message<boolean>> | Promise<InteractionResponse<boolean>> {
    const input = interaction.options.getString("guess");
    // Check if there are any existing games in progress for this channel.
    if (!this.games.has(interaction.channelId)) {
      return this.start(interaction.user, interaction);
    }

    // Destroy the game after 10 minutes.
    const diff = TimeUtilities.difference(
      Date.now(),
      this.games.get(interaction.channelId).startTime
    );

    if (diff.seconds > 600) {
      this.games.delete(interaction.channelId);
      if (input) {
        return interaction.reply(
          "The game has expired. Use `hangman` to start a new game."
        );
      }
      return this.start(interaction.user, interaction);
    }

    if (
      this.games.get(interaction.channelId).isGameOver ||
      this.games.get(interaction.channelId).won
    ) {
      return this.start(interaction.user, interaction);
    }

    this.guess(interaction, input);
  }

  private start(
    owner: User,
    message: Message | ChatInputCommandInteraction
  ): Promise<Message<boolean>> | Promise<InteractionResponse<boolean>> {
    const newGame = new HangmanGame(owner.id);
    const started = newGame.start();

    if (started) {
      this.games.set(message.channelId, newGame);
      const letters = newGame.getLettersToShow();
      let output = `I'm thinking of a **${letters.length}** lettered word. Start guessing! `;

      for (let i = 0; i < letters.length; i++) {
        output += escapeMarkdown(letters[i] + " ");
      }

      return message.reply(output);
    }

    return message.reply("Could not start this game.");
  }

  private guess(
    message: Message | ChatInputCommandInteraction,
    input: string
  ): Promise<Message<boolean>> | Promise<InteractionResponse<boolean>> {
    if (!input) {
      return message.reply("Please provide a guess.");
    }

    // Only use the first character as the guess
    input = input[0];

    return message.reply(
      escapeMarkdown(this.games.get(message.channelId).guess(input))
    );
  }
}
