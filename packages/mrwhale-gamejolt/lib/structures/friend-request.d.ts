import { Client } from "../client/client";
import { User } from './user';
export declare class FriendRequest {
    client: Client;
    id: number;
    user_id: number;
    target_user_id: number;
    user: User;
    target_user: User;
    created_on: Date;
    accepted_on: Date;
    declined_on: Date;
    state: number;
    constructor(client: Client, data: Partial<FriendRequest>);
    accept(): Promise<unknown>;
}
