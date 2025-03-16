/**
 * Represents the data returned from the Site API.
 */
export interface ApiData<T> {
  /**
   * The payload returned from the API.
   */
  payload: T;
}
