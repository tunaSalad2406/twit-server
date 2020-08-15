import { Entity, BaseEntity, PrimaryColumn, ManyToOne, Column } from "typeorm";
import { User } from "./User";
import { Twit } from "./Twit";

@Entity()
export class Interest extends BaseEntity {
    @Column("bool", { default: true })
    value: boolean;

    @PrimaryColumn("int")
    userId: number;

    @PrimaryColumn("int")
    twitId: number;

    @ManyToOne(() => User, user => user.interests,
        { cascade: true, onDelete: "CASCADE", primary: true })
    user: User;

    @ManyToOne(() => Twit, twit => twit.interests, {
        cascade: true,
        onDelete: "CASCADE", primary: true
    })
    twit: Twit;
}
