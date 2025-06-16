import TransportStream from "winston-transport";
import dbInstance from "./db-connect";
import {
  getCurrentDate,
  getCurrentDateTime,
  getCurrentTime,
} from "./time";
import { LOG_LEVELS } from "../constants/logger-constants";
import shutdown_handler from "./shutdown-handler";


const SERVICE_NAME = "optionChain";
const LOG_COLLECTION_NAME = "LOGS";

interface LogInfo {
  level: string;
  message: string | Record<string, any>;
  [key: string]: any;
}

interface StructuredLog extends Record<string, any> {
  level: string;
  level_no: number;
  date: string;
  time: string;
  timestamp: number;
  time_zone: string;
  microservice: string;
  msg?: string | Record<string, any>;
}

const is_plain_object = (obj: any): obj is Record<string, any> => {
  return obj != null && typeof obj === "object" && obj.constructor === Object;
};

class DBTransport extends TransportStream {
  collection_name: string;
  batch_size: number;
  interval: number;
  logs: any[];
  collection: any;

  constructor() {
    let opts = {};
    super(opts);
    this.level = "db";
    this.collection_name = LOG_COLLECTION_NAME;
    this.batch_size = 20;
    this.interval = 5000;
    this.logs = [];
    this.collection = null;

    this.initDB();
    this.startBatchWriter();
    shutdown_handler.registerCleanupFunction(async()=>this.closeConnection(),true)
  }

  async initDB(): Promise<void> {
    try {
      const db = await dbInstance.connect();
      this.collection = db.collection(this.collection_name);
      console.log(
        `${getCurrentDateTime()} | INFO | LOG DATABASE Connected for logging`
      );
    } catch (error) {
      console.error(
        `${getCurrentDateTime()} | ERROR | Error in Connection to MongoDB`,
        error
      );
    }
  }

  async empty_log_list(): Promise<void> {
    if (!this.collection || this.logs.length === 0) return;
    try {
      await this.collection.insertMany(this.logs);
      this.logs = [];
    } catch (error) {
      console.error(
        `${getCurrentDateTime()} | Error | Error in Adding Log to Database`,
        error
      );
    }
  }

  async send_to_db(): Promise<void> {
    if (!this.collection || this.logs.length === 0) return;
    try {
      const logsToWrite = this.logs.splice(0, this.batch_size);
      await this.collection.insertMany(logsToWrite);
    } catch (error) {
      
      console.error(
        `${getCurrentDateTime()} | Error | Error in Adding Log to Database`,
        error
      );
    }
  }

  async startBatchWriter(): Promise<void> {
    setInterval(async () => {
      await this.send_to_db();
    }, this.interval);
  }

  async log(info: LogInfo, callback: () => void) {
    setImmediate(() => this.emit("logged", info));
    try {
      if (!["notify", "notifylog"].includes(info.level)) {
        let object_to_log: StructuredLog = {
          level: info.level,
          level_no: LOG_LEVELS["db"] - LOG_LEVELS[info.level],
          date: getCurrentDate(),
          time: getCurrentTime(),
          timestamp: Date.now(),
          time_zone: "IST (UTC+5:30)",
          microservice: SERVICE_NAME,
        };
        if (is_plain_object(info.message))
          object_to_log = { ...object_to_log, ...info.message };
        else object_to_log.msg = info.message;

        this.logs.push(object_to_log);
      }
    } catch (error) {
      console.error(
        `${getCurrentDateTime()} | ERROR | Error in pushing to log queue: `,
        error
      );
    }
    await this.send_to_db();
    callback();
  }

  async closeConnection(): Promise<void> {
    try {
      await this.empty_log_list();
      console.log(
        `${getCurrentDateTime()} | INFO | LOG DATABASE Connection Closed`
      );
    } catch (error) {
      console.error(
        `${getCurrentDateTime()} | ERROR | Error in Closing MongoDB Connection: `,
        error
      );
    }
  }
}

export default DBTransport
