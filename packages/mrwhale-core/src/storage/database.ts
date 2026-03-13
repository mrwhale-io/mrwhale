import { Sequelize } from "sequelize";

import { logger } from "../util/logger";

/**
 * A singleton database class that manages a SQLite connection using Sequelize.
 *
 * This class implements the singleton pattern to ensure only one database connection
 * exists throughout the application lifecycle. It provides methods to initialize
 * the connection and access the Sequelize instance.
 *
 * @example
 * ```typescript
 * // First time initialization
 * const db = Database.instance('path/to/database.sqlite');
 * await db.init();
 *
 * // Subsequent access
 * const connection = Database.connection;
 * ```
 */
export class Database {
  private static _instance: Database;
  connection: Sequelize;

  private constructor(url: string) {
    if (Database._instance) {
      throw new Error("Cannot create multiple instances of Database.");
    }
    Database._instance = this;
    this.connection = new Sequelize({
      dialect: "sqlite",
      storage: url,
    });
  }

  /**
   * Returns the Sequelize connection instance for the database.
   *
   * @throws Will throw an error if the database has not been initialized yet.
   * @returns The Sequelize connection instance
   */
  static get connection(): Sequelize {
    return Database.instance().connection;
  }

  /**
   * Returns the database instance containing the Sequelize connection.
   *
   * @param [url] The database url.
   */
  static instance(url?: string): Database {
    if (!url && !Database._instance) {
      throw new Error(
        "Url is required the first time the database is accessed.",
      );
    }

    if (this._instance) {
      return this._instance;
    }

    return new Database(url);
  }

  /**
   * Initializes the database connection by attempting to authenticate.
   * If authentication fails, logs the error and exits the process.
   *
   * @returns A Promise that resolves when the database connection is successfully authenticated
   * @throws Will exit the process if database authentication fails
   */
  async init(): Promise<void> {
    try {
      await this.connection.authenticate();
    } catch (error) {
      logger.error(error);
      process.exit();
    }
  }
}
