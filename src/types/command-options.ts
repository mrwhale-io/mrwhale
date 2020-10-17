import { CommandTypes } from "./command-types";

export interface CommandOptions {
  name: string;
  description: string;
  type: CommandTypes;
  usage: string;
  argSeparator?: string;
  groupOnly?: boolean;
}
