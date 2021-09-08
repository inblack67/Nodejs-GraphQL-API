import { queryType } from 'nexus';
import { NOT_AUTHENTICATED } from '../constants';
import { IMyContext } from '../interface';
import { isAuthenticated } from '../utils';
import { GetMeType } from './GetMeType';

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
  },
});
