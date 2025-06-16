// Utils/resolverLogger.ts
import { GraphQLResolveInfo } from 'graphql';
import logger from './logger';
import { Context } from '../graphql/context';

export const withLogging = <TArgs = any, TResult = any>(
  resolver: (parent: any, args: TArgs, context: Context, info: GraphQLResolveInfo) => Promise<TResult> | TResult
) => {
  return async (parent: any, args: TArgs, context: Context, info: GraphQLResolveInfo): Promise<TResult> => {
    const startTime = Date.now();
    const operationName = info.fieldName;
    
    try {
      const result = await resolver(parent, args, context, info);
      
      // Only log for authenticated users (protected routes)
      if (context.userId) {
        const logData = {
          time_taken: Date.now() - startTime,
          received_at: startTime,
          status_code: 200,
          received_payload: {
            operationName,
            variables: args
          },
          userId: context.userId,
          method: "POST",
          url: "/graphql",
          sent_payload: result,
          ip: context.req.headers["x-forwarded-for"] || context.req.ip,
          operation_name: operationName,
          operation_type: info.operation.operation
        };
        
        logger.api(logData);
      }
      
      return result;
    } catch (error) {
      if (context.userId) {
        const logData = {
          time_taken: Date.now() - startTime,
          received_at: startTime,
          status_code: 400,
          received_payload: {
            operationName,
            variables: args
          },
          userId: context.userId,
          method: "POST",
          url: "/graphql",
          sent_payload: null,
          ip: context.req.headers["x-forwarded-for"] || context.req.ip,
          operation_name: operationName,
          errors: [error instanceof Error ? error.message : String(error)]
        };
        
        logger.api(logData);
      }
      
      throw error;
    }
  };
};

// Usage in resolvers:
// export const resolvers = {
//   Query: {
//     getUser: withLogging(async (parent, args, context) => {
//       // Your resolver logic
//     }),
//     getUserProfile: withLogging(async (parent, args, context) => {
//       // Your resolver logic  
//     })
//   },
//   Mutation: {
//     updateUser: withLogging(async (parent, args, context) => {
//       // Your resolver logic
//     })
//   }
// };