import Broker, { IBroker } from "../Models/broker-model";
import logger from "../Utils/logger";
import redis from "../Utils/redis";

const client = redis.getRedisClient("optionChain");

export const setBroker = async (userId: string,broker: IBroker): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        await client.HSET(
            userId,
            `broker_${broker.actid}`,
            JSON.stringify(broker)
        );
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
    }
};

export const getBroker = async (userId: string,actid: string): Promise<IBroker | undefined> => {
    if (!client) throw new Error("Redis client is not initialized");

    const cachedBroker = await client.HGET(userId, `broker_${actid}`);
    if (!cachedBroker) {
        const broker = await Broker.findOne({ userId, actid }).select("+accessToken").lean();
        if (!broker) return undefined;
        await setBroker(userId, broker);
        return broker;
    }
    return JSON.parse(cachedBroker);
};

export const set_all_brokers = async (userId: string,brokers?: IBroker[],set_from_db: boolean = false): Promise<void> => {
    try {
        let data: IBroker[] = brokers ?? [];
        if (set_from_db || !brokers) {
            data = await Broker.find({ userId }).select("+accessToken").lean();
        }

        if (!client) throw new Error("Redis client is not initialized");
        await client.HSET(userId, "all_brokers", JSON.stringify(data));
    } catch (error) {
        logger.notify("Error in setting all brokers in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
    }
};

export const get_all_brokers = async (userId: string): Promise<IBroker[] | undefined> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        const cached = await client.HGET(userId, "all_brokers");
        if (!cached ||cached === "[]") {
            const brokers = await Broker.find({ userId }).select("+accessToken").lean();
            await set_all_brokers(userId, brokers);
            return brokers;
        }
        return JSON.parse(cached);
    } catch (error) {
        logger.notify("Error in getting all brokers from cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};

export const delete_broker = async (userId: string,actid: string): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        await client.HDEL(userId, `broker_${actid}`);
        await set_all_brokers(userId, undefined, true);
    } catch (error) {
        logger.notify("Error in deleting broker from cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
    }
};

export const delete_user_from_cache = async (userId: string): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        await client.DEL(userId);
    } catch (error) {
        logger.notify("Error in deleting user cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
    }
};
