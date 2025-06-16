import { createClient, RedisClientType, RedisClientOptions } from "redis";
import { REDIS_CONFIG, RedisConfig } from "../Env/env";
import logger from "./logger";
import shutdown_handler from "./shutdown-handler";

type ExtendedRedisClient = RedisClientType<any> & {
  topic_on_message_map: Record<string, (message: string) => void>;
};

function toRedisClientOptions(config: RedisConfig): RedisClientOptions {
  return {
    socket: {
      host: config.host,
      port: Number(config.port),
    },
    ...(config.password !== "NONE" ? { password: config.password } : {}),
  };
}

class RedisConnection {
  client_map: Record<string, RedisClientType<any>> = {};
  pub_map: Record<string, RedisClientType<any>> = {};
  sub_map: Record<string, ExtendedRedisClient> = {};

  async init() {
    for (const conf of REDIS_CONFIG) {
      const redis_config = toRedisClientOptions(conf);

      if (conf.cache) await this.connect_cache(redis_config, conf.name);
      // if (conf.pub) await this.connect_publisher(redis_config, conf.name);
      // if (conf.sub)
      //   await this.connect_subscribe(
      //     redis_config,
      //     conf.name,
      //     conf.topics_to_subscribe
      //   );
    }
  }

  set_hooks(
    redis_client: RedisClientType<any>,
    name: string,
    type: string,
    shutdown_function: () => Promise<void>
  ) {
    redis_client.on("connect", () =>
      logger.info(`Redis connected: ${name} (${type})`)
    );
    redis_client.on("error", (err: Error) => {
      logger.error({ msg: `Redis error (${name} - ${type}):`, error: err });
    });
    redis_client.on("ready", () =>
      logger.info(`Redis ready: ${name} (${type})`)
    );
    redis_client.on("end", () =>
      logger.info(`Redis closed: ${name} (${type})`)
    );

    shutdown_handler.registerCleanupFunction(shutdown_function, true);
  }

  async connect_cache(config: RedisClientOptions, name: string) {
    const client = createClient(config) as RedisClientType<any>;

    this.client_map[name] = client;
    this.set_hooks(this.client_map[name], name, "cache", async () => {
      if (this.client_map[name]?.isOpen) {
        await this.client_map[name]?.quit();
        logger.info(`Redis ${name} connection is being closed. Type: cache`);
      }
    });

    try {
      await this.client_map[name].connect();
    } catch (err) {
      logger.error({
        msg: `Failed to connect Redis cache client ${name}:`,
        error: err,
      });
    }
  }

  // async connect_publisher(config: RedisClientOptions, name: string) {
  //   const client = createClient(config) as RedisClientType<any>;

  //   this.pub_map[name] = client;
  //   this.set_hooks(this.pub_map[name], name, "publishing", async () => {
  //     if (this.pub_map[name].isOpen) {
  //       await this.pub_map[name]?.quit();
  //       logger.info(
  //         `Redis ${name} connection is being closed. Type: publishing`
  //       );
  //     }
  //   });

  //   try {
  //     await this.pub_map[name].connect();
  //   } catch (err) {
  //     logger.error({
  //       msg: `Failed to connect Redis publisher client ${name}:`,
  //       error: err,
  //     });
  //   }
  // }

  // async connect_subscribe(
  //   config: RedisClientOptions,
  //   name: string,
  //   topics_to_subscribe: string[]
  // ) {
  //   const client = createClient(config);

  //   // Create extended client by adding the required property
  //   const extendedClient = Object.assign(client, {
  //     topic_on_message_map: {} as Record<string, (message: string) => void>,
  //   }) as ExtendedRedisClient;

  //   this.sub_map[name] = extendedClient;

  //   this.set_hooks(extendedClient, name, "subscribing", async () => {
  //     if (extendedClient.isOpen) {
  //       await extendedClient.quit();
  //       logger.info(
  //         `Redis ${name} connection is being closed. Type: subscribing`
  //       );
  //     }
  //   });

  //   try {
  //     await extendedClient.connect();
  //     for (const topic of topics_to_subscribe) {
  //       await extendedClient.subscribe(topic, (message) => {
  //         const handler = extendedClient.topic_on_message_map[topic];
  //         if (handler) {
  //           handler(message);
  //         } else {
  //           logger.info(`Received message on ${topic}: ${message}`);
  //         }
  //       });
  //     }
  //   } catch (err) {
  //     logger.error({
  //       msg: `Failed to connect Redis subscriber client ${name}:`,
  //       error: err,
  //     });
  //   }
  // }

  // async publish_message(name: string, message: string | object, topic: string) {
  //   if (this.pub_map[name]) {
  //     try {
  //       await this.pub_map[name].publish(
  //         topic,
  //         typeof message === "string" ? message : JSON.stringify(message)
  //       );
  //     } catch (err) {
  //       logger.error({
  //         msg: `Failed to publish message on ${topic} via ${name}:`,
  //         error: err,
  //       });
  //     }
  //   } else {
  //     logger.error(`Publish client ${name} not found.`);
  //   }
  // }

  getRedisClient(name: string): RedisClientType<any> | undefined {
    return this.client_map[name];
  }

  // set_on_message(name: string, topic: string, fn: (message: string) => void) {
  //   const client = this.sub_map[name];
  //   if (client) {
  //     client.topic_on_message_map[topic] = fn;
  //   } else {
  //     logger.error({
  //       msg: `Subscriber client ${name} not found when setting message handler.`,
  //     });
  //   }
  // }
}

export default new RedisConnection();