export interface Command {
  name: string;
  description: string;
  type: string;
  usage: string;
  aliases: string[];
  examples: string[];
  guildOnly: boolean;
}
