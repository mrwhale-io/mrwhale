export interface CommandOptions {
  name: string;
  description: string;
  usage: string;
  argSeparator?: string;
  groupOnly?: boolean;
}
