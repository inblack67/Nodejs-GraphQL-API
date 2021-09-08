import { User } from '.prisma/client';
import { mutationType, stringArg } from 'nexus';
import {
  ALREADY_TAKEN,
  INVALID_CREDENTIALS,
  NOT_AUTHENTICATED,
  NOT_AUTHORIZED,
} from '../constants';
import { IMyContext } from '../interface';
import { hashPassword, isAuthenticated, verifyPassword } from '../utils';

export const Mutation = mutationType({
  definition(t) {
    t.boolean('logoutUser', {
      resolve: (_, __, { session }: IMyContext) => {
        if (!isAuthenticated(session)) {
          return new Error(NOT_AUTHENTICATED);
        }
        session.destroy((err) => {
          if(err){
            console.log(`Error destroying session => `);
            console.error(err);
          }
        });
        return true;
      },
    });
    t.boolean('loginUser', {
      args: {
        username: stringArg(),
        password: stringArg(),
      },
      resolve: async (
        _,
        { ...userDetails }: Pick<User, 'username' | 'password'>,
        { prisma, session }: IMyContext,
      ) => {
        try {
          if (isAuthenticated(session)) {
            return new Error(NOT_AUTHORIZED);
          }

          const user = await prisma.user.findUnique({
            where: {
              username: userDetails.username,
            },
          });

          if (!user) {
            return new Error(INVALID_CREDENTIALS);
          }

          const isCorrect = await verifyPassword(
            userDetails.password,
            user.password,
          );

          if (!isCorrect) {
            return new Error(INVALID_CREDENTIALS);
          }

          session['userId'] = user.id;

          return true;
        } catch (err) {
          const errorCaught = err as any;
          return new Error(errorCaught.message);
        }
      },
    });
    t.boolean('registerUser', {
      args: {
        name: stringArg(),
        email: stringArg(),
        password: stringArg(),
        username: stringArg(),
      },
      resolve: async (
        _,
        { ...userDetails }: Omit<User, 'id'>,
        { prisma, session }: IMyContext,
      ) => {
        try {
          if (isAuthenticated(session)) {
            return new Error(NOT_AUTHORIZED);
          }

          const hashedPassword = await hashPassword(userDetails.password);
          await prisma.user.create({
            data: {
              ...userDetails,
              password: hashedPassword,
            },
          });
          return true;
        } catch (err) {
          const errorCaught = err as any;
          if (errorCaught.code === 'P2002') {
            const errorMessage = `${errorCaught.meta.target.toString()} ${ALREADY_TAKEN}`;
            return new Error(errorMessage);
          } else {
            return new Error(errorCaught.message);
          }
        }
      },
    });
  },
});
