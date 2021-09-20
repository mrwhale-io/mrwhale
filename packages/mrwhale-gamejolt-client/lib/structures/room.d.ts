import { User } from "./user";
export declare enum RoomType {
    Pm = "pm",
    ClosedGroup = "closed_group",
    FiresideGroup = "fireside_group"
}
export declare class Room {
    id: number;
    title: string;
    type: RoomType;
    user?: User;
    description: string;
    members: User[];
    owner_id: number;
    get owner(): User;
    constructor(data?: Partial<Room>);
}
