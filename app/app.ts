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
import { getStatusCode } from "../constants/common";

// CORS configurations
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight']
};

const app = express();

app.set("trust proxy", true);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(hpp());

if (process.env.NODE_ENV === 'development') {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://embeddable-sandbox.cdn.apollographql.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://embeddable-sandbox.cdn.apollographql.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://embeddable-sandbox.cdn.apollographql.com"],
        fontSrc: ["'self'", "https://embeddable-sandbox.cdn.apollographql.com"],
        frameSrc: ["'self'", "https://embeddable-sandbox.cdn.apollographql.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
}

app.get("/api/v1/healthCheck", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: true,
    message: "Health is OK",
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
                const httpStatusCode = getStatusCode(errors[0].extensions.code as string)
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
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => await createContext({ req, res }),
    })
  );

  return server;
};

export default app;