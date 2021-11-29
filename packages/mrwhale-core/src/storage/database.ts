import { Sequelize } from "sequelize";

import { logger } from "../util/logger";

/**
 * Manages the Sequelize database connection.
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
   * Get the Sequelize connection.
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
        "Url is required the first time the database is accessed."
      );
    }

    if (this._instance) {
      return this._instance;
    }

    return new Database(url);
  }

  /**
   * Initialise the database connection.
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
