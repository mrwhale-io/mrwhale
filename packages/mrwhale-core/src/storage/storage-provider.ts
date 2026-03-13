/**
 * Abstract base class for storage providers that handle persistent data storage operations.
 *
 * This class defines the interface for storage implementations that can store, retrieve,
 * and manage key-value pairs asynchronously. Concrete implementations should provide
 * specific storage mechanisms such as file system, database, or cloud storage.
 *
 * @abstract
 * @example
 * ```typescript
 * class FileStorageProvider extends StorageProvider {
 *   async init(): Promise<void> {
 *     // Initialize file storage
 *   }
 *
 *   async get(key: string, defaultValue?: unknown): Promise<unknown> {
 *     // Retrieve value from file
 *   }
 *
 *   async set(key: string, value: unknown): Promise<void> {
 *     // Save value to file
 *   }
 *
 *   async remove(key: string): Promise<void> {
 *     // Delete value from file
 *   }
 * }
 * ```
 */
export abstract class StorageProvider {
  /**
   * Initialise the storage provider, setting up any necessary connections or resources.
   * This method should be called before any get, set, or remove operations are performed.
   *
   * @returns A promise that resolves when the initialization is complete
   * @throws Will throw an error if initialization fails
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
