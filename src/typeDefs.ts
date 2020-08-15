import { gql } from "apollo-server-express"

export const typeDefs = gql`
    scalar Date
    scalar GraphQLUpload
    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }
    type UserComment {
        id: ID!
        content: String
        user: User
        createdAt: Date
        updatedAt: Date
    }
    type Query {
        me: User
        getTwits: [Twit]
        getTwit(id:ID!): Twit
        getComments(id:ID!): [UserComment]
    }
    type User {
        id: ID!
        email: String
    }
    type Comment {
        id: ID!
        content: String
    }
    type Interest {
        twitId: ID!
        userId: ID!
    }
    type Tokens {
        accessToken: String
        refreshToken: String
    }
    input InputUser {
        email: String!
        password: String!
    }
    type Twit {
        content: String!
        author: User
        id: String
        createdAt: Date
        updatedAt: Date
        image: String
        interests: [Interest]
        interestCount: Int
        comments: [Comment]
        commentCount: Int
    }
    input InputTwit {
        content: String
        file: GraphQLUpload
    }
    input InputUpdateTwit {
        content: String
        id: ID!
    }
    type Mutation {
        register(input: InputUser!): User!
        login(input: InputUser!): Tokens!
        createTwit(input: InputTwit): Twit!
        updateTwit(input: InputUpdateTwit): Twit!
        deleteTwit(id: ID!): Boolean!
        interestTwit(twitID:ID!): Boolean!
        commentTwit(input:InputUpdateTwit) : Twit!
    }
    type Subscription {
        createTwit: Twit!
        deleteTwit: ID!
        updateTwit: Twit!
        interestTwit: Twit!
        commentTwit: Twit!
    }
`
