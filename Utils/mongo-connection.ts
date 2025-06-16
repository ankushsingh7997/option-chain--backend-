import mongoose, { mongo } from "mongoose";
import { DB_URL } from "../Env/env";
import logger from "./logger";
import { getCurrentDateTime } from "./time";
import shutdown_handler from "./shutdown-handler";

let connection: any;

export async function connectToDb(): Promise<void> {
  mongoose
    .connect(DB_URL)
    .then((con) => {
      connection = con;
      logger.info("Database Connection Successfull");
    })
    .catch((err) => {
      logger.info(err);
    });
}

async function close_db_connection(): Promise<any> {
  if (connection) {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.error(
        `${getCurrentDateTime()} | ERROR | Error in closing database connection: `,
        error
      );
    }
  }
}

shutdown_handler.registerCleanupFunction(async ()=>close_db_connection(),true)