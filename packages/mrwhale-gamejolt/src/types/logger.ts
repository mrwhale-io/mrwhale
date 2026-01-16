/**
 * Represents a logging interface with methods for logging messages
 * at various levels of severity.
 */
export interface Logger {
  /**
   * Logs a message at the info level.
   * @param message The message to log.
   * @param meta Additional metadata to log.
   */
  info(message: string, ...meta: any[]): void;

  /**
   * Logs a message at the warning level.
   * @param message The message to log.
   * @param meta Additional metadata to log.
   */
  warn(message: string, ...meta: any[]): void;

  /**
   * Logs a message at the error level.
   * @param message The message to log.
   * @param meta Additional metadata to log.
   */
  error(message: string, ...meta: any[]): void;

  /**
   * Logs a message at the debug level.
   * @param message The message to log.
   * @param meta Additional metadata to log.
   */
  debug?(message: string, ...meta: any[]): void;
}
