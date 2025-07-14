// GraphQl/context.ts (Enhanced version)
import { Request, Response } from 'express';
import { getAndVerifyUser } from "../Middleware/jwt";
import User from "../Models/user-model";
import { ENVIRONMENT } from "../Env/env";
import logger from '../Utils/logger';

export interface Context {
  req: Request;
  res: Response;
  userId?: string;
  user?: any;
  environment: string;
}

export const createContext = async ({ req, res }: { req: Request; res: Response }): Promise<Context> => {
  const context: Partial<Context> = {
    req,
    res,
    environment: ENVIRONMENT,
  };

  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.jwt;

  if (token) {
    try {
      const verification = await getAndVerifyUser(User, token);
      if (verification.status && verification.data && verification.id) {
        context.userId = verification.id;
        context.user = verification.data;
      }
    } catch (error) {
      // handle Error in catch block 
    }
  }



  return {
    ...context,
  } as Context;
};