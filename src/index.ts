import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { getSchema } from './graphql/schema';
import { getMyPrismaClient } from './db';

const main = async () => {
  const app = express();

  const schema = getSchema();
  const prismaClient = await getMyPrismaClient();

  const apolloSever = new ApolloServer({
    schema,
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
