import { createLogger, format, transports } from "winston";
import * as path from "path";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(process.cwd(), "logs/error.log"),
      level: "error",
    }),
    new transports.File({ filename: path.join(process.cwd(), "logs/full.log") }),
  ],
});

// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}
