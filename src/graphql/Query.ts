import { intArg, queryType } from 'nexus';
import { INTERNAL_SERVER_ERROR, NOT_AUTHENTICATED, ROWS_LIMIT } from '../constants';
import { ICursor, IMyContext } from '../interface';
import { isAuthenticated } from '../utils';
import { GetMeType } from './GetMeType';
import { PostType } from './PostType';
import { UserType } from './UserType';

export const Query = queryType( {
  definition( t ) {
    t.field( 'hello', {
      type: 'String',
      resolve: () => 'worlds',
    } );
    t.field( 'getMe', {
      type: GetMeType,
      resolve: ( _, __, { session }: IMyContext ) => {
        if ( !isAuthenticated( session ) ) {
          return new Error( NOT_AUTHENTICATED );
        }
        return {
          userId: session.userId,
        };
      },
    } );

    t.list.field( 'posts', {
      type: PostType,
      args: {
        cursor: intArg()
      },
      resolve: async ( _, { cursor }: ICursor, { prisma, session }: IMyContext ) => {
        try {
          if ( !isAuthenticated( session ) ) {
            return new Error( NOT_AUTHENTICATED );
          }
          return await prisma.post.findMany( {
            take: ROWS_LIMIT,
            skip: cursor,
            select: {
              content: true,
              createdAt: true,
              id: true,
              userId: true,
              title: true,
              user: {
                select: {
                  username: true,
                  id: true,
                },
              },
            },
          } );
        } catch ( err ) {
          console.error( err );
          return new Error( INTERNAL_SERVER_ERROR );
        }
      },
    } );

    t.list.field( 'users', {
      type: UserType,
      resolve: async ( _, __, { prisma, session }: IMyContext ) => {
        try {
          if ( !isAuthenticated( session ) ) {
            return new Error( NOT_AUTHENTICATED );
          }
          return await prisma.user.findMany( {
            select: {
              email: true,
              id: true,
              createdAt: true,
              username: true,
              name: true,
            },
          } );
        } catch ( err ) {
          console.error( err );
          return new Error( INTERNAL_SERVER_ERROR );
        }
      },
    } );
  },
} );
