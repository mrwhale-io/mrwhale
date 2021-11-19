import { Model, DataTypes } from "sequelize";
import { StorageProvider } from "./storage-provider";
import { Database } from "./database";
import { StorageProviderConstructor } from "../types/storage-provider-constructor";

interface Storage extends Model {
  key: string;
  value: string;
}

/**
 * Storage provider for sqlite for managing key/value settings.
 *
 * @param url The database url.
 */
export function SqliteStorageProvider(url: string): StorageProviderConstructor {
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
        }
      );
    }

    async init(): Promise<void> {
      await this.database.init();
      await this.database.connection.sync();
    }

    async get(key: string, defaultValue?: string): Promise<string> {
      const entry = (await this.model.findByPk(key)) as Storage;

      if (entry === null) {
        return;
      }

      return entry.value ? entry.value : defaultValue;
    }

    async set(key: string, value: string): Promise<void> {
      await this.model.upsert({ key, value });
    }

    async remove(key: string): Promise<void> {
      await this.model.destroy({ where: { key } });
    }
  };
}
