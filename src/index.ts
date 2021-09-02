import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { getSchema } from './graphql/schema';
import { getMyPrismaClient } from './db';
import { IMyContext } from './interface';

const main = async () => {
  const app = express();

  const prisma = await getMyPrismaClient();
  const schema = getSchema();

  const apolloSever = new ApolloServer({
    schema,
    context: ({ req, res }): IMyContext => ({
      req,
      res,
      prisma,
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
