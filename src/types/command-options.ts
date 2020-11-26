import { CommandTypes } from "./command-types";

export interface CommandOptions {
  name: string;
  description: string;
  type: CommandTypes;
  usage: string;
  examples?: string[];
  argSeparator?: string;
  groupOnly?: boolean;
  ownerOnly?: boolean;
  aliases?: string[];
}
