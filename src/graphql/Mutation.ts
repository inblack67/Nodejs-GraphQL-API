import { User } from '.prisma/client';
import { mutationType, stringArg } from 'nexus';
import { IMyContext } from '../interface';
import { hashPassword, verifyPassword } from '../utils';

export const Mutation = mutationType({
  definition(t) {
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
          const user = await prisma.user.findUnique({
            where: {
              username: userDetails.username,
            },
          });

          if (!user) {
            return new Error('Invalid Credentials');
          }

          const isCorrect = await verifyPassword(
            userDetails.password,
            user.password,
          );

          if (!isCorrect) {
            return new Error('Invalid Credentials');
          }

          session['userId'] = user.id;

          return true;
        } catch (err) {
          const errorCaught = err as any;
          if (errorCaught.code === 'P2002') {
            const errorMessage = `${errorCaught.meta.target.toString()} already taken`;
            return new Error(errorMessage);
          } else {
            return new Error(errorCaught.message);
          }
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
        { prisma }: IMyContext,
      ) => {
        try {
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
            const errorMessage = `${errorCaught.meta.target.toString()} already taken`;
            return new Error(errorMessage);
          } else {
            return new Error(errorCaught.message);
          }
        }
      },
    });
  },
});
