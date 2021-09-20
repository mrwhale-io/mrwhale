"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const events = require("events");
const chat_manager_1 = require("./chat/chat-manager");
const api_manager_1 = require("./api/api-manager");
const grid_manager_1 = require("./grid/grid-manager");
const FRIEND_REQUEST_INTERVAL = 60;
/**
 * The main client for interacting with the chat and site api.
 */
class Client extends events.EventEmitter {
    /**
     * @param options The client options.
     */
    constructor(options) {
        super();
        this.userId = options.userId;
        this.chat = new chat_manager_1.ChatManager(this, {
            frontend: options.frontend,
            baseUrl: options.baseChatUrl,
        });
        this.api = new api_manager_1.APIManager(this, options.frontend, options.baseApiUrl);
        this.grid = new grid_manager_1.GridManager(this, {
            frontend: options.frontend,
            baseUrl: options.baseGridUrl,
        });
        this.rateLimitRequests = options.rateLimitRequests || 1;
        this.rateLimitDuration = options.rateLimitDuration || 1;
        this.initTimers();
    }
    /**
     * Send a request to the site api to fetch the client user's friend requests.
     */
    fetchFriendRequests() {
        return this.api.getFriendRequests().then((requests) => {
            if (requests) {
                this.emit("friend_requests", requests);
            }
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    /**
     * Initialise timers to send fetch requests.
     * This keeps the notification/friend requests and counts
     * up to date. This Should only be used internally.
     */
    initTimers() {
        setInterval(() => {
            this.fetchFriendRequests();
        }, FRIEND_REQUEST_INTERVAL * 1000);
    }
}
exports.Client = Client;
