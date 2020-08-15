import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User"
import { Twit } from "./Twit"

@Entity()
export class Comment extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(_type => User, user => user.comments,
        { cascade: true, onDelete: "CASCADE", primary: true })
    user: number;

    @ManyToOne(_type => Twit, twit => twit.comments,
        { cascade: true, onDelete: "CASCADE", primary: true })
    twit: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
