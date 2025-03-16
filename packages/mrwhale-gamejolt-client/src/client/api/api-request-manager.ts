import Axios, { AxiosInstance } from "axios";

import { APIClientOptions } from "../../types/api-client-options";
import { Client } from "../client";

const DEFAULT_BASE_URL = "https://gamejolt.com/site-api";

/**
 * Manages API requests to the site API.
 *
 * This class provides methods to send GET and POST requests to the Game Jolt site API.
 * It uses Axios for HTTP requests and handles setting up the necessary headers
 * and base URL for the requests.
 */
export class APIRequestManager {
  protected axios: AxiosInstance;

  constructor(protected client: Client, options: APIClientOptions) {
    this.axios = Axios.create({
      baseURL: options.base || DEFAULT_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain",
        Connection: "keep-alive",
        Host: "gamejolt.com",
        Origin: "https://gamejolt.com",
        "mrwhale-token": options.mrwhaleToken,
        Cookie: `frontend=${options.frontend}`,
      },
    });
  }

  /**
   * Sends a GET request to the site API and returns the response data.
   *
   * @template T The expected payload response type.
   * @param url The URL to send the GET request to.
   * @returns A promise that resolves to the response data of type T.
   * @throws Throws an error if the GET request fails.
   */
  protected async get<T>(url: string): Promise<T> {
    try {
      const result = await this.axios.get<T>(url);
      return result.data;
    } catch (error) {
      throw new Error(`GET ${url} failed: ${error.message}`);
    }
  }

  /**
   * Sends a POST request to the site API and returns the response data.
   *
   * @template T The expected payload response type.
   * @param url The URL to send the POST request to.
   * @param [data] The data to be sent in the POST request body.
   * @returns A promise that resolves to the response data of type T.
   * @throws Throws an error if the POST request fails.
   */
  protected async post<T>(url: string, data?: any): Promise<T> {
    try {
      const result = await this.axios.post<T>(url, data);
      return result.data;
    } catch (error) {
      throw new Error(`POST ${url} failed: ${error.message}`);
    }
  }
}
