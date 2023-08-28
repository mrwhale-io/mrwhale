import { User } from "./user";

export class Block {
  id!: number;
  blocked_on!: number;
  expires_on!: number;
  reason!: string;
  resource!: "Community" | "User";
  resource_id!: number;

  user!: User;

  constructor(data: Partial<Block>) {
    Object.assign(this, data);

    if (data.user) {
      this.user = new User(data.user);
    }
  }
}
