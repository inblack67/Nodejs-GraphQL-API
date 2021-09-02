import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import session from 'express-session';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import RedisSession from 'connect-redis';

import { getSchema } from './graphql/schema';
import { getMyPrismaClient } from './db';
import { IMyContext } from './interface';
import { isProd } from './utils';

const main = async () => {
  dotenv.config();

  const RedisClient = new Redis();
  const RedisStore = RedisSession(session);
  const prisma = await getMyPrismaClient();

  const app = express();

  app.use(
    session({
      store: new RedisStore({ client: RedisClient }),
      secret: process.env.SESSION_SECRET!,
      name: 'gql-api',
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: isProd(),
        sameSite: 'lax',
        domain: '.apollographql.com',
      },
    }),
  );

  const schema = getSchema();

  const apolloSever = new ApolloServer({
    schema,
    context: ({ req, res }): IMyContext => ({
      req,
      res,
      prisma,
      session: req.session,
      redis: RedisClient,
    }),
  });

  await apolloSever.start();

  apolloSever.applyMiddleware({ app });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
