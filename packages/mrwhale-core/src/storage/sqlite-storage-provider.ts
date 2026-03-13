import { Model, DataTypes } from "sequelize";

import { StorageProvider } from "./storage-provider";
import { Database } from "./database";
import { StorageProviderConstructor } from "../types/storage-provider-constructor";

/** Represents a storage entry in the SQLite database. */
interface Storage extends Model {
  /** The key of the storage entry. */
  key: string;
  /** The value of the storage entry. */
  value: string;
}

/**
 * Creates a SQLite-based storage provider class that implements the StorageProvider interface.
 * This factory function returns a class that uses Sequelize ORM to interact with a SQLite database
 * for storing key-value pairs.
 *
 * @param url - Optional database connection URL. If not provided, uses the default database instance
 * @returns A constructor function for the SQLite storage provider class
 *
 * @example
 * ```typescript
 * const StorageClass = SqliteStorageProvider('sqlite://path/to/database.db');
 * const storage = new StorageClass('myTable');
 * await storage.init();
 * await storage.set('key', 'value');
 * const value = await storage.get('key');
 * ```
 */
export function SqliteStorageProvider(
  url?: string,
): StorageProviderConstructor {
  return class extends StorageProvider {
    private readonly database: Database;
    private readonly model: (new () => Model) & typeof Model;

    /**
     * @param name The name of the model to create.
     */
    constructor(name: string) {
      super();
      this.database = Database.instance(url);

      this.model = class extends Model {};
      this.model.init(
        {
          key: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
          value: DataTypes.TEXT,
        },
        {
          modelName: name,
          timestamps: false,
          freezeTableName: true,
          sequelize: this.database.connection,
        },
      );
    }

    /**
     * Initializes the SQLite storage provider by setting up the database connection
     * and synchronizing the database schema.
     *
     * @returns A promise that resolves when the initialization is complete
     * @throws Will throw an error if database initialization or synchronization fails
     */
    async init(): Promise<void> {
      await this.database.init();
      await this.database.connection.sync();
    }

    /**
     * Retrieves a value from storage by its key.
     *
     * @param key - The unique identifier for the stored value
     * @param defaultValue - Optional default value to return if the key is not found or has no value
     * @returns A promise that resolves to the stored value, the default value, or undefined if not found
     */
    async get(key: string, defaultValue?: string): Promise<string> {
      const entry = (await this.model.findByPk(key)) as Storage;

      if (entry === null) {
        return;
      }

      return entry.value ? entry.value : defaultValue;
    }

    /**
     * Sets a key-value pair in the storage.
     * If the key already exists, its value will be updated. If it doesn't exist, a new entry will be created.
     *
     * @param key - The unique identifier for the stored value
     * @param value - The string value to store
     * @returns A promise that resolves when the operation is complete
     */
    async set(key: string, value: string): Promise<void> {
      await this.model.upsert({ key, value });
    }

    /**
     * Removes a record from storage by its key.
     *
     * @param key - The unique identifier of the record to remove
     * @returns A promise that resolves when the record has been successfully removed
     * @throws May throw an error if the database operation fails
     */
    async remove(key: string): Promise<void> {
      await this.model.destroy({ where: { key: key } as any });
    }
  };
}
