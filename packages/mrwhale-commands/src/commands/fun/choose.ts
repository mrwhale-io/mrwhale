import { CommandOptions, validateChoices } from "@mrwhale-io/core";

// Configuration
const MAX_CHOICE_LENGTH = 100;
const MAX_CHOICES = 20;

export const RESPONSES = [
  "Oh it has to be <<CHOICE>>",
  "I'd have to go with <<CHOICE>>",
  "It's obviously <<CHOICE>>",
  "It's <<CHOICE>> for sure.",
  "I'd have to say <<CHOICE>>",
  "Definitely <<CHOICE>>",
  "The answer is <<CHOICE>>",
  "My choice is <<CHOICE>>",
  "You're better off with <<CHOICE>>",
  "I have decided it's <<CHOICE>>",
  "I've thought long and hard, however I have decided it's <<CHOICE>>",
  "There's no comparison to <<CHOICE>>",
];

export const data: CommandOptions = {
  name: "choose",
  description: "Choose between one or multiple choices.",
  type: "fun",
  usage: "<prefix>choose <choice> or <choice> ...",
  examples: [
    "<prefix>choose Whale or Dolphin",
    "<prefix>choose Apple, Orange, Banana",
  ],
  aliases: ["choice", "decide"],
};

export function action(args: string[]): string {
  const choices = args.join();
  if (!choices.trim()) {
    return "No choices have been passed.";
  }

  const separators = [" or ", ","];
  const rawOptions = choices.split(new RegExp(separators.join("|"), "gi"));

  const validationResult = validateChoices(
    rawOptions,
    MAX_CHOICES,
    MAX_CHOICE_LENGTH,
  );

  if (!validationResult.valid) {
    return validationResult.message!;
  }

  const cleanOptions = validationResult.choices!;

  if (cleanOptions.length < 2) {
    return "Please provide at least two different choices.";
  }

  const index = Math.floor(Math.random() * RESPONSES.length);
  const choice = multiDecide(cleanOptions);

  return RESPONSES[index].replace(/<<CHOICE>>/g, choice);
}

/**
 * Selects a random option from the provided list.
 *
 * @param options The list of options to choose from.
 * @returns A randomly selected option, or "nothing" if the list is empty.
 */
function multiDecide(options: string[]): string {
  if (options.length === 0) {
    return "nothing";
  }

  const selected = options[Math.floor(Math.random() * options.length)];
  return selected || "nothing";
}
