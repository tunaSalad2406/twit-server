import { IResolvers } from "apollo-server-express"
// import { GraphQLDateTime } from "graphql-iso-date"
import { AuthenticationError, PubSub } from "apollo-server-express"
import * as bcrypt from "bcryptjs"
import * as fs from "fs";
import { User } from "./entity/User"
import { Twit } from "./entity/Twit"
import { setTokens } from "./middlewares"
import { Interest } from "./entity/Interest";
import { Comment } from "./entity/Comment";


const pubsub = new PubSub();

export const resolvers: IResolvers = {
  // Date: GraphQLDateTime,
  Query: {
    me: async (_, __, { req }) => {
      if (!req.user) throw new AuthenticationError("Must authenticate");
      const user = User.findOne({ id: req.user.id })
      if (!user) return null
      return user
    },
    getTwits: async () => {
      const result = await Twit.find({
        order: {
          createdAt: "DESC"
        },
        relations: ['author', 'interests', 'comments']
      })

      if (!result) return null;
      return result;
    },
    getTwit: async (_, { id }) => {
      const twit = await Twit.findOne(id, { relations: ['author', 'interests', 'comments'] });
      if (!twit) return null;
      return twit;
    },
    getComments: async (_, { id }) => {
      try {
        const comments = await Comment.find({
          where: { twit: id },
          relations: ['user'],
        })
        return comments;
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    register: async (_, { input }) => {
      const user = await User.create({
        email: input.email,
        password: input.password
      }).save()
      return user
    },
    login: async (_, { input }) => {
      const user = await User.findOne({ email: input.email })
      if (!user) return null
      const valid = await bcrypt.compare(input.password, user.password)
      if (!valid) return null
      return setTokens(user);
    },
    createTwit: async (_, { input }, { req }) => {
      let image = ""
      if (input.file) {
        image = await processUpload(input.file);
      }

      const userId = req.user.id;
      const user = await User.findOne({ id: userId });
      if (!user) return null;

      const newTwit = await Twit.create({
        content: input.content,
        author: user,
        image
      }).save();

      const extraData = { ...newTwit, author: user, interests: [] }

      pubsub.publish('createTwit', { createTwit: extraData })
      return extraData
    },
    updateTwit: async (_, { input }) => {
      try {
        const twit = await Twit.findOne(input.id);
        if (!twit) return false;
        twit.content = input.content;
        await twit.save();
        const result = await Twit.findOne(input.id, { relations: ['author', 'interests', 'comments'] });

        pubsub.publish('updateTwit', { updateTwit: result });
        return result
      } catch (err) {
        return false;
      }
    },
    deleteTwit: async (_, { id }) => {
      try {
        (await Twit.findOne(id, { relations: ["interests"] }) as Twit).remove();

        pubsub.publish('deleteTwit', { deleteTwit: id })
        return true
      } catch (error) {
        return false
      }
    },
    interestTwit: async (_, { twitID }, { req }) => {
      try {
        const twit = await Twit.findOne(twitID);
        if (!twit) return false;

        const user = await User.findOne(req.user.id);
        if (!user) return false;

        await Interest.create({
          user: user,
          twit: twit,
        }).save()

        const result = await Twit.findOne(twitID, { relations: ['author', 'interests', 'comments'] });
        if (!result) return false;

        pubsub.publish('interestTwit', { interestTwit: result })
        return true;
      } catch (err) {
        return false
      }
    },
    commentTwit: async (_, { input }, { req }) => {
      try {
        const twit = await Twit.findOne(input.id);
        if (!twit) return false;

        const user = await User.findOne(req.user.id);
        if (!user) return false;
        await Comment.create({
          content: input.content,
          user: user.id,
          twit: twit.id
        }).save();

        const result = await Twit.findOne(twit.id, { relations: ['author', 'interests', 'comments'] });
        if (!result) return false;

        pubsub.publish('commentTwit', { commentTwit: result })
        return result;
      } catch (err) {
        return false
      }
    }
  },
  Subscription: {
    createTwit: {
      subscribe: () => pubsub.asyncIterator('createTwit')
    },
    deleteTwit: {
      subscribe: () => pubsub.asyncIterator('deleteTwit')
    },
    updateTwit: {
      subscribe: () => pubsub.asyncIterator('updateTwit')
    },
    interestTwit: {
      subscribe: () => pubsub.asyncIterator('interestTwit')
    },
    commentTwit: {
      subscribe: () => pubsub.asyncIterator('commentTwit')
    }
  },
  Twit: {
    interestCount: (twit) => {
      return twit.interests.length;
    },
    commentCount: (twit) => {
      return twit.comments.length;
    }
  }
}


const processUpload = async (image: any) => {
  const { createReadStream, filename } = await image;
  const stream = createReadStream();
  const { path } = await storeUpload({ stream, filename })
  return path
}

const storeUpload = async ({ stream, filename }: any): Promise<any> => {
  if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
  }

  const uniquePath = Date.now();
  const path = `./uploads/${uniquePath}${filename}`;

  return new Promise((resolve, reject) =>
    stream.pipe(fs.createWriteStream(path))
      .on('finish', () => resolve({ path }))
      .on('error', reject),
  )
}
