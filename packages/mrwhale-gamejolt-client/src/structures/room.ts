import { User } from "./user";

export enum RoomType {
  Pm = "pm",
  ClosedGroup = "closed_group",
  FiresideGroup = "fireside_group",
}

export class Room {
  id!: number;
  title!: string;
  type!: RoomType;
  user?: User;
  description!: string;
  members: User[] = [];
  owner_id!: number;

  get owner(): User {
    return this.type === RoomType.ClosedGroup
      ? this.members.find((member) => member.id === this.owner_id)
      : null;
  }

  constructor(data: Partial<Room> = {}) {
    Object.assign(this, data);

    if (data.members) {
      this.members = data.members.map((member) => new User(member));
    }
  }
}
