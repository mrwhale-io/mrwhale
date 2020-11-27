import { CommandTypes } from "./command-types";

/**
 * Contains properties to be passed to a Command on construction.
 */
export interface CommandOptions {
  /**
   * name See: {@link Command#name}.
   */
  name: string;

  /**
   * description See: {@link Command#description}.
   */
  description: string;

  /**
   * type See: {@link Command#type}.
   */
  type: CommandTypes;

  /**
   * usage See: {@link Command#usage.}
   */
  usage: string;

  /**
   * examples See: {@link Command#examples}.
   */
  examples?: string[];

  /**
   * argSeparator See: {@link Command#argSeparator}.
   */
  argSeparator?: string;

  /**
   * groupOnly See: {@link Command#groupOnly}.
   */
  groupOnly?: boolean;

  /**
   * ownerOnly See: {@link Command#ownerOnly}.
   */
  ownerOnly?: boolean;

  /**
   * aliases See: {@link Command#aliases}.
   */
  aliases?: string[];
}
