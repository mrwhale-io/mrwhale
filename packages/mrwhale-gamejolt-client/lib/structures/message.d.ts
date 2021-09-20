import { User } from "./user";
import { Client } from "../client/client";
import { Content } from "../content/content";
export declare class Message {
    client: Client;
    id: number;
    user_id: number;
    user: User;
    room_id: number;
    content: string;
    logged_on: Date;
    private replied;
    get textContent(): string;
    get mentions(): User[];
    get isMentioned(): boolean;
    get isRoomOwner(): boolean;
    constructor(client: Client, data?: Partial<Message>);
    /**
     * Reply directly to this message.
     *
     * @param message The content of the message.
     */
    reply(message: string | Content): Promise<Message>;
    /**
     * Edit the message content.
     *
     * @param message The content of the message
     */
    edit(message: string | Content): void;
    toString(): string;
}
