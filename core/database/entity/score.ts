import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Score {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  roomId: number;

  @Column()
  exp: number;
}
