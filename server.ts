import {PORT} from "./Env/env"
import app, { createApolloServer } from "./app/app";
import logger from "./Utils/logger";

import { connectToDb } from "./Utils/mongo-connection";

connectToDb();


const startServer=async()=>{
    connectToDb();
    const apolloServer = await createApolloServer();

    const server = app.listen(PORT, () => {
        logger.info(`🚀 Server ready at http://localhost:${PORT}`);
        logger.info(`🚀 GraphQL endpoint: http://localhost:${PORT}/graphql`);
        logger.info(`🎮 GraphQL Playground: http://localhost:${PORT}/graphql`);
      });


    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        await apolloServer.stop();
        server.close(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });
}

startServer();