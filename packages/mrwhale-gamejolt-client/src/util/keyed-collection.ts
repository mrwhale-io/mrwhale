/**
 * KeyedCollection is a generic class that represents a collection of items
 * indexed by a unique key. It allows for adding, retrieving, removing, and checking
 * the existence of items in the collection.
 */
export class KeyedCollection<K, V> {
  /**
   * The internal collection of items.
   * The key is of type `K`, and the value is of type `V`.
   */
  private _items: Map<K, V> = new Map();

  /**
   * Adds an item to the collection.
   *
   * @param key The key of the item.
   * @param value The value of the item.
   * @throws An error if the key already exists in the collection.
   */
  add(key: K, value: V): void {
    if (this._items.has(key)) {
      throw new Error(`Key "${key}" already exists in the collection.`);
    }
    this._items.set(key, value);
  }

  /**
   * Retrieves an item from the collection by its key.
   *
   * @param key The key of the item to retrieve.
   * @returns The value associated with the key, or `undefined` if not found.
   */
  get(key: K): V | undefined {
    return this._items.get(key);
  }

  /**
   * Removes an item from the collection by its key.
   *
   * @param key The key of the item to remove.
   * @throws An error if the key does not exist in the collection.
   */
  remove(key: K): void {
    if (!this._items.has(key)) {
      throw new Error(`Key "${key}" does not exist in the collection.`);
    }
    this._items.delete(key);
  }

  /**
   * Checks if the collection contains a key.
   *
   * @param key The key to check.
   * @returns `true` if the key exists in the collection, otherwise `false`.
   */
  has(key: K): boolean {
    return this._items.has(key);
  }

  /**
   * Gets all keys in the collection.
   *
   * @returns An array of all keys in the collection.
   */
  keys(): K[] {
    return Array.from(this._items.keys());
  }

  /**
   * Gets all values in the collection.
   *
   * @returns An array of all values in the collection.
   */
  values(): V[] {
    return Array.from(this._items.values());
  }

  /**
   * Gets the number of items in the collection.
   *
   * @returns The size of the collection.
   */
  size(): number {
    return this._items.size;
  }

  /**
   * Clears all items from the collection.
   */
  clear(): void {
    this._items.clear();
  }
}
