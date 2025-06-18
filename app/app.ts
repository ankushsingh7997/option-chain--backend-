import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import redisConnetion from "../Utils/redis";
redisConnetion.init();

//GraphQL imports
import { typeDefs } from "../graphql/type-defs/index";
import { resolvers } from "../graphql/resolvers/index";
import { createContext, Context } from "../graphql/context";

import logger from "../Utils/logger";
import { allowedUrls, getStatusCode, corsOptions, localHelmetConfig, productionHelmetConfig } from "../constants/common";
import { BASE_URL } from "../Env/env";


const app = express();

// CORS configurations
app.set("trust proxy", true);
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Apollo-Require-Preflight,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Apply other middleware AFTER CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());

// Environment-specific helmet configuration
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Running in development mode - relaxed security');
  app.use(helmet(localHelmetConfig));
} else {
  console.log('🔒 Running in production mode - strict security');
  app.use(helmet(productionHelmetConfig));
}


app.get("/api/v1/healthCheck", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: true,
    message: "Health is OK",
    timestamp: new Date().toISOString()
  });
});

export const createApolloServer = async () => {
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
        includeCookies: true
      }),
      // Plugin to handle HTTP status codes
      {
        async requestDidStart() {
          return {
            async willSendResponse(requestContext) {
              const { response, errors } = requestContext;
              
              if (errors && errors.length > 0) { 
                const httpStatusCode = getStatusCode(errors[0].extensions?.code as string)
                response.http!.status = httpStatusCode;
              }
            }
          };
        }
      }
    ],
    formatError: (formattedError, error) => {
      logger.error(formattedError);
      return {
        status: false,
        message: formattedError.message,
        code: formattedError.extensions?.code,
        path: formattedError.path
      };
    },
    // Enable introspection and playground in development
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return await createContext({ req, res });
      },
    })
  );

  return server;
};

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('❌ Error middleware triggered:', err.message);
  console.log('🌐 Request origin:', req.headers.origin);
  
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      status: false,
      message: 'CORS policy violation - Origin not allowed',
      origin: req.headers.origin,
      allowedOrigins: [allowedUrls, BASE_URL]
    });
  } else {
    console.error('Unhandled error:', err);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
});

export default app;