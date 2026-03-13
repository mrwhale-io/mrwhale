import { StorageProvider } from "./storage-provider";

/**
 * A storage provider that uses a key to store and retrieve data.
 * It wraps around another storage provider and adds a key-based interface.
 */
export class KeyedStorageProvider {
  protected readonly _key: string;
  protected readonly _storageProvider: StorageProvider;
  protected _cache: { [key: string]: any };

  /**
   * @param storageProvider The storage provider.
   * @param key The key to store under.
   */
  constructor(storageProvider: StorageProvider, key: string) {
    this._key = key;
    this._cache = {};
    this._storageProvider = storageProvider;
  }

  /**
   * Initializes the storage provider by fetching existing data from the underlying storage provider using the specified key.
   * If no data is found for the key, it initializes an empty object and stores it in the underlying storage provider.
   * The fetched or initialized data is then cached in memory for faster access during subsequent get/set operations.
   */
  async init(): Promise<void> {
    let data: any = await this._storageProvider.get(this._key);

    if (typeof data === "undefined") {
      data = {};
      await this._storageProvider.set(this._key, JSON.stringify(data));
    } else {
      data = JSON.parse(data);
    }

    this._cache = data;
  }

  /**
   * Get a value from the store.
   *
   * @param key The key of the value to fetch.
   * @param [defaultValue] The default value to return if no value is found.
   */
  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    if (!this._cache) {
      return defaultValue;
    }

    const value = this._cache[key];
    return typeof value !== "undefined" ? value : defaultValue;
  }

  /**
   * Set a value in the store.
   *
   * @param key The key of the value to set.
   * @param value The value to set for the given key.
   */
  async set(key: string, value: unknown): Promise<void> {
    this._cache[key] = value;

    await this._storageProvider.set(this._key, JSON.stringify(this._cache));
  }

  /**
   * Remove a key from the store.
   *
   * @param key The key of the value to remove.
   */
  async remove(key: string): Promise<void> {
    delete this._cache[key];

    await this._storageProvider.set(this._key, JSON.stringify(this._cache));
  }
}
