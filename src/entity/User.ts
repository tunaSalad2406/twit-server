import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import * as bcrypt from "bcryptjs"
import { Twit } from "./Twit"
import { Comment } from "./Comment"
import {Interest} from "./Interest"
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text', { unique: true })
    email: string;

    @Column()
    password: string;

    @OneToMany(_type => Twit, twit => twit.author)
    twits: Twit[]

    @OneToMany(_type => Comment, comment => comment.user)
    comments: Comment[]

    @OneToMany(_type => Interest, interest => interest.user)
    interests: Interest[]

    @BeforeInsert()
    @BeforeUpdate()
    preSave = async () => {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 8)
        }
    }
}
