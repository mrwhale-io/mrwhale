import { CommandOptions } from "@mrwhale-io/core";

const responses = [
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

function multiDecide(options: string[]): string {
  const selected = options[Math.floor(Math.random() * options.length)];
  if (!selected) {
    return this.multiDecide(options);
  }
  return selected;
}

export const data: CommandOptions = {
  name: "ping",
  description: "Sends back a pong response.",
  type: "utility",
  usage: "<prefix>ping",
};

export function action(args: string[]): string {
  const choices = args.join();
  if (!choices) {
    return "No choices have been passed.";
  }

  const separators = ["or", ","];
  const options = choices.split(new RegExp(separators.join("|"), "gi"));

  if (options.length > 1) {
    const index = Math.floor(Math.random() * responses.length);
    const choice = multiDecide(options).trim();

    return responses[index].replace(/<<CHOICE>>/g, choice);
  } else {
    return "Please pass two or more choices.";
  }
}
