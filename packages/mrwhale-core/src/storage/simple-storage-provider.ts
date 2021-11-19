import { StorageProvider } from "./storage-provider";

export class SimpleStorageProvider {
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
   * Initialise the storage provider
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
  get(key: string, defaultValue?: unknown): Promise<any> {
    return this._cache
      ? typeof this._cache[key] !== "undefined"
        ? this._cache[key]
        : defaultValue
      : defaultValue;
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
   * @param key The key of the value to set.
   */
  async remove(key: string): Promise<void> {
    delete this._cache[key];

    await this._storageProvider.set(this._key, JSON.stringify(this._cache));
  }
}
