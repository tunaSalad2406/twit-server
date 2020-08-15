import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from 'apollo-server-express';
import * as path from "path";
import * as express from "express"
import { typeDefs } from "./typeDefs"
import { resolvers } from "./resolvers"
import { validateTokensMiddleware } from "./middlewares"
import * as http from "http"
import { Comment } from "./entity/Comment"
import { Interest } from "./entity/Interest"
import { Twit } from "./entity/Twit"
import { User } from "./entity/User"


(async () => {
  const app = express();
  app.use("/public/uploads", express.static(path.join(__dirname, "../uploads")));
  app.use(validateTokensMiddleware)
  await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    synchronize: true,
    entities: [Comment, Interest, Twit, User]
  });
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res })
  });
  server.applyMiddleware({ app });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port: process.env.PORT || 4000 }, () =>
    console.log(`🚀 Server ready at ${server.graphqlPath}`)
  )
})()


