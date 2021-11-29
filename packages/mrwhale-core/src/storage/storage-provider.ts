/**
 * Abstract class for storage providers to implement.
 */
export abstract class StorageProvider {
  /**
   * Initialise the storage provider
   */
   abstract init(): Promise<void>;

  /**
   * Get a value from the store.
   *
   * @param key The key of the value to fetch.
   * @param [defaultValue] The default value to return if no value is found.
   */
   abstract get(key: string, defaultValue?: unknown): Promise<unknown>;

  /**
   * Set a value in the store.
   * 
   * @param key The key of the value to set.
   * @param value The value to set for the given key.
   */
   abstract set(key: string, value: unknown): Promise<void>;

  /**
   * Remove a key from the store.
   *
   * @param key The key of the value to set.
   */
   abstract remove(key: string): Promise<void>;
}
