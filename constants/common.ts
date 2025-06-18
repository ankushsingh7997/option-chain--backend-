import { BASE_URL } from "../Env/env"

interface status{
    [key:string]:number
}

const statusCode:status={
    UNAUTHENTICATED:401,
    FORBIDDEN:403,
    NOT_FOUND:404,
    BAD_USER_INPUT:400,
    GRAPHQL_VALIDATION_FAILED:400,
    INTERNAL_SERVER_ERROR:500
}
export const getStatusCode=(status:string)=>{
    return statusCode[status ]||400
}

export const productionHelmetConfig = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://embeddable-sandbox.cdn.apollographql.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://embeddable-sandbox.cdn.apollographql.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://embeddable-sandbox.cdn.apollographql.com"],
        fontSrc: ["'self'", "https://embeddable-sandbox.cdn.apollographql.com"],
        frameSrc: ["'self'", "https://embeddable-sandbox.cdn.apollographql.com"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' as const } 
  } 


  export const localHelmetConfig={
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: false
  }

  export const allowedUrls=['http://localhost:5173','http://localhost:5174','http://127.0.0.1:5173','http://127.0.0.1:5174',]

  export const  corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      
      if (!origin) {
        return callback(null, true);
      }
      
      const allowedOrigins = [
        BASE_URL,
        ...allowedUrls
      ];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Apollo-Require-Preflight',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  };