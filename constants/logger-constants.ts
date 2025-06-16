// logger_constants.ts
import winston, { Logger as WinstonLogger } from "winston";

export type LogLevelMap = { [key: string]: number };

export interface CustomLogger extends WinstonLogger {
  notify: (msg: string | object) => this;
  notifylog: (msg: string | object) => this;
  error: (msg: string | object) => this;
  request: (msg: string | object) => this;
  order: (msg: string | object) => this;
  api: (msg: string | object) => this;
  db: (msg: string | object) => this;
  warn: (msg: string | object) => this;
  info: (msg: string | object) => this;
  debug: (msg: string | object) => this;
  telegram: (msg: string | object) => this;
}

export const LOG_LEVELS: LogLevelMap = {
  notify: 1,
  notifylog: 2,
  error: 3,
  request: 4,
  order: 5,
  api: 6,
  db: 7,
  warn: 8,
  info: 9,
  debug: 10,
  telegram: 11,
};

export const LEVEL =
  process.env.NODE_ENV?.trim() === "production" ? "info" : "debug";

export const LOG_BATCH_SIZE = 25;
export const LOG_INTERVAL = 5000;
