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
  // Add logging utility to context
  // logOperation: (data: {
  //   operationName?: string;
  //   variables?: any;
  //   result?: any;
  //   errors?: any[];
  //   startTime: number;
  // }) => void;
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

  // const logOperation = (data: {
  //   operationName?: string;
  //   variables?: any;
  //   result?: any;
  //   errors?: any[];
  //   startTime: number;
  // }) => {
  //   if (context.userId) {
  //     const logData = {
  //       time_taken: Date.now() - data.startTime,
  //       received_at: data.startTime,
  //       status_code: data.errors ? 400 : 200,
  //       received_payload: {
  //         operationName: data.operationName,
  //         variables: data.variables
  //       },
  //       userId: context.userId,
  //       method: "POST",
  //       url: "/graphql",
  //       sent_payload: {
  //         data: data.result,
  //         errors: data.errors
  //       },
  //       ip: req.headers["x-forwarded-for"] || req.ip,
  //       operation_name: data.operationName,
  //       errors: data.errors
  //     };
      
  //     logger.api(logData);
  //   }
  // };

  return {
    ...context,
    // logOperation
  } as Context;
};