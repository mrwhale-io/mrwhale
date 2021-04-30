import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Setting {
  @PrimaryColumn()
  roomId: number;

  @Column()
  setting: string;
}
