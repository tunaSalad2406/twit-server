import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User"
import { Comment } from "./Comment"
import { Interest } from "./Interest"

@Entity()
export class Twit extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @ManyToOne(_type => User, user => user.twits)
    author: User

    @OneToMany(() => Interest, interest => interest.twit)
    interests: Interest[]

    @OneToMany(_type => Comment, comment => comment.twit)
    comments: Comment[]

    @Column({ nullable: true })
    image: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
