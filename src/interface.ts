import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export interface IMyContext {
  req: Request;
  res: Response;
  prisma: PrismaClient;
}
