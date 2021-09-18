/**
 * Contains properties to be passed to a ChatManager on construction.
 */
export interface ChatManagerOptions {
    /**
     * The base url of the chat server.
     */
    baseUrl?: string;
    /**
     * The session identifier to auth with.
     */
    frontend: string;
}
