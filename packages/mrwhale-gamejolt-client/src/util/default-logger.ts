import { Logger } from "../types/logger";

/**
 * Default logger implementation that outputs formatted log messages to the console.
 *
 * Provides standard logging levels (info, warn, error, debug) with consistent
 * message formatting that includes log level prefixes.
 *
 * @example
 * ```typescript
 * defaultLogger.info('Application started', { port: 3000 });
 * defaultLogger.warn('Deprecated feature used');
 * defaultLogger.error('Database connection failed', error);
 * defaultLogger.debug('Processing user request', { userId: 123 });
 * ```
 */
export const defaultLogger: Logger = {
  info: (message: string, ...meta: any[]) =>
    console.log(`[INFO] ${message}`, ...meta),
  warn: (message: string, ...meta: any[]) =>
    console.warn(`[WARN] ${message}`, ...meta),
  error: (message: string, ...meta: any[]) =>
    console.error(`[ERROR] ${message}`, ...meta),
  debug: (message: string, ...meta: any[]) =>
    console.debug(`[DEBUG] ${message}`, ...meta),
};
