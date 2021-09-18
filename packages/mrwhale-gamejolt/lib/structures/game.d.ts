import { User } from "./user";
export declare class Game {
    id: number;
    title: string;
    developer: User;
    published_on: number;
    posted_on: number;
    follower_count: number;
    tigrs: number;
    creation_tool: string;
    creation_tool_human: string;
    category: string;
    constructor(data: Partial<Game>);
    toString(): string;
}
