import { Logger } from "../types/logger";

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
