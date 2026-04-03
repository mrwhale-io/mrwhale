/**
 * Contains all command types.
 * These are used to categorize commands and can be used for filtering in the dashboard and help commands.
 * Each command must have a type that is one of these values.
 */
export type CommandTypes =
  | "admin"
  | "custom"
  | "economy"
  | "fishing"
  | "useful"
  | "fun"
  | "utility"
  | "game"
  | "image"
  | "effects"
  | "ai"
  | "level"
  | "subscription";
