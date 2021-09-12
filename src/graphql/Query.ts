import { queryType } from 'nexus';
import { INTERNAL_SERVER_ERROR, NOT_AUTHENTICATED } from '../constants';
import { IMyContext } from '../interface';
import { isAuthenticated } from '../utils';
import { GetMeType } from './GetMeType';
import { PostType } from './PostType';

export const Query = queryType({
  definition(t) {
    t.field('hello', {
      type: 'String',
      resolve: () => 'worlds',
    });
    t.field('getMe', {
      type: GetMeType,
      resolve: (_, __, { session }: IMyContext) => {
        if (!isAuthenticated(session)) {
          return new Error(NOT_AUTHENTICATED);
        }
        return {
          userId: session.userId,
        };
      },
    });

    t.list.field('posts', {
      type: PostType,
      resolve: async (_, __, { prisma, session }: IMyContext) => {
        try {
          if (!isAuthenticated(session)) {
            return new Error(NOT_AUTHENTICATED);
          }
          const posts = await prisma.post.findMany({
            select: {
              user: {
                select: {
                  username: true,
                  id: true,
                },
              },
            },
          });
          return posts;
        } catch (err) {
          console.error(err);
          return new Error(INTERNAL_SERVER_ERROR);
        }
      },
    });
  },
});
